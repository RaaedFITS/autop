// routes/python.js
const express = require('express');
const router = express.Router();
const { triggerPythonScript, cancelPythonScript } = require('../controllers/pythonController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  if (allowedTypes.includes(file.mimetype) || file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// @route   POST /api/python/trigger
// @desc    Trigger Python script with uploaded file and flow name
// @access  Private
router.post('/trigger', authenticateToken, authorizeRoles('admin'), upload.single('file'), triggerPythonScript);

// @route   POST /api/python/cancel
// @desc    Cancel running Python script
// @access  Private
router.post('/cancel', authenticateToken, authorizeRoles('admin'), cancelPythonScript);

module.exports = router;
