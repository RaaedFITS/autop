// controllers/userController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

// Get All Users
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, role, created_at FROM users');
    res.json({ users });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const [users] = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Fetch flows assigned to the user
    const [userFlows] = await pool.query(
      'SELECT flows.id, flows.name FROM user_flows JOIN flows ON user_flows.flow_id = flows.id WHERE user_flows.user_id = ?',
      [userId]
    );

    user.flows = userFlows;

    res.json({ user });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { email, password, role } = req.body;
  
    try {
      // Check if user exists
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = users[0];
  
      // Prepare updated fields
      let updatedEmail = email || user.email;
      let updatedRole = role || user.role;
      let updatedPassword = user.password;
  
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedPassword = await bcrypt.hash(password, salt);
      }
  
      // Update user in database
      await pool.query(
        'UPDATE users SET email = ?, password = ?, role = ? WHERE id = ?',
        [updatedEmail, updatedPassword, updatedRole, userId]
      );
  
      // Fetch updated user
      const [updatedUsers] = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]);
      const updatedUser = updatedUsers[0];
  
      res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Update User Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Delete User
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user (due to ON DELETE CASCADE, related user_flows will be deleted)
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign Flows to User
const assignFlows = async (req, res) => {
    const userId = req.params.id;
    const { flowIds } = req.body; // Expecting an array of flow IDs
  
    if (!Array.isArray(flowIds)) {
      return res.status(400).json({ message: 'flowIds must be an array' });
    }
  
    try {
      // Check if user exists
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Remove existing flows
      await pool.query('DELETE FROM user_flows WHERE user_id = ?', [userId]);
  
      // Assign new flows
      const userFlows = flowIds.map(flowId => [userId, flowId]);
      if (userFlows.length > 0) {
        await pool.query('INSERT INTO user_flows (user_id, flow_id) VALUES ?', [userFlows]);
      }
  
      res.json({ message: 'Flows assigned to user successfully' });
    } catch (error) {
      console.error('Assign Flows Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
// Get User Flows Publicly
const getUserFlowsPublic = async (req, res) => {
    const userId = req.params.id;
  
    try {
      // Check if user exists
      const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch flows assigned to the user
      const [userFlows] = await pool.query(
        'SELECT flows.id, flows.name FROM user_flows JOIN flows ON user_flows.flow_id = flows.id WHERE user_flows.user_id = ?',
        [userId]
      );
  
      res.json({ flows: userFlows });
    } catch (error) {
      console.error('Get User Flows Public Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = { getUsers, getUserById, updateUser, deleteUser, assignFlows, getUserFlowsPublic };