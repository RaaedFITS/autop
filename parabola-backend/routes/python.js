// routes/pythonRoutes.js
const express = require('express');
const router = express.Router();
const { triggerPythonScript, cancelPythonScript } = require('../controllers/pythonController');

// Route to trigger the Python script
router.post('/trigger-python', triggerPythonScript);

// Route to cancel the Python script
router.post('/cancel-python-script', cancelPythonScript);

module.exports = router;
