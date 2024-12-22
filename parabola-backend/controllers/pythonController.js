// controllers/pythonController.js
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');

// Define the upload path
const uploadPath = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Created uploads directory at ${uploadPath}`);
  }
} catch (err) {
  console.error(`Failed to create uploads directory at ${uploadPath}: ${err.message}`);
  process.exit(1); // Exit the server if the uploads directory cannot be created
}

// In-memory store to keep track of running processes (userId: childProcess)
const runningProcesses = {};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter to accept only CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
  }
};

// Initialize Multer
const upload = multer({ storage, fileFilter }).single('file');

// Controller to trigger Python script
const triggerPythonScript = (req, res) => {
  // Handle file upload
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      console.error(`Multer error: ${err.message}`);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Other errors
      console.error(`Upload error: ${err.message}`);
      return res.status(400).json({ message: err.message });
    }

    const { flowName } = req.body;
    const file = req.file;

    if (!flowName) {
      // Flow name is required
      return res.status(400).json({ message: 'Flow name is required.' });
    }

    if (!file) {
      // File is required
      return res.status(400).json({ message: 'File upload failed. Please upload a valid file.' });
    }

    // For testing purposes, assign a unique user ID or identifier
    // In a real-world scenario, this would come from the authenticated user
    const userId = req.headers['x-user-id'] || 'test-user'; // Use a custom header for identification

    // Check if a process is already running for this user
    if (runningProcesses[userId]) {
      return res.status(400).json({ message: 'A script is already running for this user.' });
    }

    // Validate PYTHON_SCRIPT_PATH
    if (!process.env.PYTHON_SCRIPT_PATH) {
      console.error('PYTHON_SCRIPT_PATH is not defined in the environment variables.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    // Path to the Python script
    const pythonScriptPath = path.resolve(process.env.PYTHON_SCRIPT_PATH);

    // Check if the Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      console.error(`Python script not found at path: ${pythonScriptPath}`);
      return res.status(500).json({ message: 'Python script not found on the server.' });
    }

    // Spawn the Python process
    const pythonProcess = spawn('python', [pythonScriptPath, flowName, file.path]);

    // Store the process in the runningProcesses object
    runningProcesses[userId] = pythonProcess;

    try {
      // Await the completion of the Python script
      const scriptResult = await new Promise((resolve, reject) => {
        let scriptSuccess = false;

        // Listen for data from stdout
        pythonProcess.stdout.on('data', (data) => {
          console.log(`User ${userId} stdout: ${data}`);
          // You can parse the output to determine success if your script outputs specific messages
        });

        // Listen for data from stderr
        pythonProcess.stderr.on('data', (data) => {
          console.error(`User ${userId} stderr: ${data}`);
          // Handle errors or log them
        });

        // Listen for process exit
        pythonProcess.on('close', (code) => {
          console.log(`User ${userId} Python script exited with code ${code}`);
          scriptSuccess = code === 0;
          resolve(scriptSuccess);
        });

        // Handle unexpected errors
        pythonProcess.on('error', (error) => {
          console.error(`Error executing Python script for user ${userId}: ${error.message}`);
          reject(error);
        });
      });

      // Remove the process from runningProcesses
      delete runningProcesses[userId];

      // Delete the uploaded file after processing
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        }
      });

      // Send response based on script success
      if (scriptResult) {
        return res.status(200).json({ message: 'Python script executed successfully.' });
      } else {
        return res.status(500).json({ message: 'Python script failed to execute.' });
      }
    } catch (error) {
      console.error(`Script execution error for user ${userId}: ${error.message}`);
      // Remove the process from runningProcesses in case of error
      delete runningProcesses[userId];
      // Delete the uploaded file after failure
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error deleting file after failure: ${err.message}`);
        }
      });
      return res.status(500).json({ message: 'Failed to execute Python script.' });
    }
  });
};

// Controller to cancel Python script
const cancelPythonScript = (req, res) => {
  // For testing purposes, assign a unique user ID or identifier
  const userId = req.headers['x-user-id'] || 'test-user'; // Use a custom header for identification

  const pythonProcess = runningProcesses[userId];

  if (!pythonProcess) {
    return res.status(400).json({ message: 'No running script found for this user.' });
  }

  try {
    // Kill the Python process
    pythonProcess.kill('SIGTERM'); // You can also use 'SIGKILL' if necessary
    console.log(`User ${userId} cancelled the Python script.`);
    // Remove the process from runningProcesses
    delete runningProcesses[userId];
    res.status(200).json({ message: 'Python script cancelled successfully.' });
  } catch (error) {
    console.error(`Error cancelling Python script for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Failed to cancel Python script.' });
  }
};

module.exports = { triggerPythonScript, cancelPythonScript };
