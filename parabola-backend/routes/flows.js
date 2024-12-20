// routes/flows.js
const express = require('express');
const router = express.Router();
const { getFlows, createFlow, updateFlow, deleteFlow } = require('../controllers/flowController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

// @route   GET /api/flows
// @desc    Get all flows
// @access  Private (admin)
router.get('/', authenticateToken, authorizeRoles('admin'), getFlows);

// @route   POST /api/flows
// @desc    Create a new flow
// @access  Private (admin)
router.post('/', authenticateToken, authorizeRoles('admin'), createFlow);

// @route   PUT /api/flows/:id
// @desc    Update a flow
// @access  Private (admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateFlow);

// @route   DELETE /api/flows/:id
// @desc    Delete a flow
// @access  Private (admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteFlow);

module.exports = router;
