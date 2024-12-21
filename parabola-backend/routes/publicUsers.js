// routes/publicUsers.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, assignFlows, getUserFlowsPublic } = require('../controllers/userController');

// Public routes for testing
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/flows', assignFlows);

// Newly added route to fetch user flows
router.get('/:id/flows', getUserFlowsPublic);

module.exports = router; 
