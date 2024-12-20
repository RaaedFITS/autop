// controllers/pythonController.js
const { spawn } = require('child_process');
const path = require('path');

// To keep track of the running Python process
let pythonProcess = null;

// Trigger Python Script
const triggerPythonScript = (req, res) => {
  const { flowName } = req.body;
  const file = req.file;

  if (!flowName || !file) {
    return res.status(400).json({ message: 'Flow name and file are required' });
  }

  if (pythonProcess) {
    return res.status(400).json({ message: 'A script is already running' });
  }

  try {
    // Define the path to your Python script
    const scriptPath = path.join(__dirname, '..', 'scripts', 'process_data.py');

    // Spawn the Python process
    pythonProcess = spawn('python', [scriptPath, flowName, file.path]);

    console.log('Python script started with PID:', pythonProcess.pid);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      // Optionally, emit events or handle real-time updates
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      // Handle errors
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
      pythonProcess = null;
      // Optionally, notify frontend about completion
    });

    res.json({ message: 'Python script started successfully' });
  } catch (error) {
    console.error('Trigger Python Script Error:', error);
    res.status(500).json({ message: 'Failed to start Python script' });
  }
};

// Cancel Python Script
const cancelPythonScript = (req, res) => {
  if (!pythonProcess) {
    return res.status(400).json({ message: 'No script is running' });
  }

  try {
    pythonProcess.kill('SIGINT'); // Sends an interrupt signal to the Python script
    console.log('Python script cancelled');
    pythonProcess = null;
    res.json({ message: 'Python script cancelled successfully' });
  } catch (error) {
    console.error('Cancel Python Script Error:', error);
    res.status(500).json({ message: 'Failed to cancel Python script' });
  }
};

module.exports = { triggerPythonScript, cancelPythonScript };
