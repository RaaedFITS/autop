// controllers/flowController.js
const pool = require('../db');

// Get All Flows
const getFlows = async (req, res) => {
  try {
    const [flows] = await pool.query('SELECT * FROM flows');
    res.json({ flows });
  } catch (error) {
    console.error('Get Flows Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Flow
const createFlow = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name.trim()) {
      return res.status(400).json({ message: 'Flow name is required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO flows (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({ message: 'Flow created successfully', flow: { id: result.insertId, name, description } });
  } catch (error) {
    console.error('Create Flow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Flow
const deleteFlow = async (req, res) => {
  const flowId = req.params.id;

  try {
    // Check if flow exists
    const [flows] = await pool.query('SELECT * FROM flows WHERE id = ?', [flowId]);
    if (flows.length === 0) {
      return res.status(404).json({ message: 'Flow not found' });
    }

    // Check if flow is assigned to any user
    const [userFlows] = await pool.query('SELECT * FROM user_flows WHERE flow_id = ?', [flowId]);
    if (userFlows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete flow assigned to users. Unassign it first.' });
    }

    // Delete flow
    await pool.query('DELETE FROM flows WHERE id = ?', [flowId]);

    res.json({ message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Delete Flow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFlows, createFlow, deleteFlow };
