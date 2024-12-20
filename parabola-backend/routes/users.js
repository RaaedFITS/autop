// routes/users.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, assignFlows } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin)
router.get('/', authenticateToken, authorizeRoles('admin'), getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (admin)
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

// @route   POST /api/users/:id/flows
// @desc    Assign flows to a user
// @access  Private (admin)
router.post('/:id/flows', authenticateToken, authorizeRoles('admin'), assignFlows);

module.exports = router;
