// routes/users.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, assignFlows } = require('../controllers/userController');
// Removed authentication and authorization middlewares for assignFlows
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, authorizeRoles('admin'), getUsers);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUserById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);
router.post('/:id/flows', assignFlows);

module.exports = router;
