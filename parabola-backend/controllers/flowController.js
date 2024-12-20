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
    const [result] = await pool.query(
      'INSERT INTO flows (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({ message: 'Flow created successfully', flowId: result.insertId });
  } catch (error) {
    console.error('Create Flow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Flow
const updateFlow = async (req, res) => {
  const flowId = req.params.id;
  const { name, description } = req.body;

  try {
    // Check if flow exists
    const [flows] = await pool.query('SELECT * FROM flows WHERE id = ?', [flowId]);
    if (flows.length === 0) {
      return res.status(404).json({ message: 'Flow not found' });
    }

    // Update flow
    await pool.query(
      'UPDATE flows SET name = ?, description = ? WHERE id = ?',
      [name, description, flowId]
    );

    res.json({ message: 'Flow updated successfully' });
  } catch (error) {
    console.error('Update Flow Error:', error);
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

    // Delete flow (due to ON DELETE CASCADE, related user_flows will be deleted)
    await pool.query('DELETE FROM flows WHERE id = ?', [flowId]);

    res.json({ message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Delete Flow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFlows, createFlow, updateFlow, deleteFlow };
