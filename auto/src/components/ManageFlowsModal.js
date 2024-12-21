// src/components/ManageFlowsModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';

const ManageFlowsModal = ({ show, handleClose, user, flows, userFlows, setUserFlows }) => {
  const [selectedFlows, setSelectedFlows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize selectedFlows when userFlows or flows change
  useEffect(() => {
    if (userFlows && flows) {
      setSelectedFlows(userFlows);
    }
  }, [userFlows, flows]);

  const handleCheckboxChange = (flowId) => {
    if (selectedFlows.includes(flowId)) {
      setSelectedFlows(selectedFlows.filter(id => id !== flowId));
    } else {
      setSelectedFlows([...selectedFlows, flowId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send the selected flow IDs to the backend to assign to the user
      const response = await axios.post(`http://localhost:5000/api/users/${user.id}/flows`, {
        flowIds: selectedFlows,
      });

      setSuccess('Flows updated successfully.');
      setUserFlows(selectedFlows); // Update the userFlows state in Admin.js
    } catch (err) {
      console.error('Assign Flows Error:', err);
      setError(err.response?.data?.message || 'Failed to assign flows.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError('');
    setSuccess('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Manage Flows for {user.email}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Display Success and Error Messages */}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

          {/* Flows List with Checkboxes */}
          {flows && flows.length > 0 ? (
            <div>
              {flows.map(flow => (
                <Form.Check
                  key={flow.id}
                  type="checkbox"
                  id={`flow-${flow.id}`}
                  label={`${flow.name} ${flow.description ? `- ${flow.description}` : ''}`}
                  checked={selectedFlows.includes(flow.id)}
                  onChange={() => handleCheckboxChange(flow.id)}
                  className="mb-2"
                />
              ))}
            </div>
          ) : (
            <p>No flows available to assign.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Flows'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

ManageFlowsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired, // The user object to whom flows are being assigned
  flows: PropTypes.array.isRequired, // All available flows
  userFlows: PropTypes.array.isRequired, // Flow IDs currently assigned to the user
  setUserFlows: PropTypes.func.isRequired, // Function to update the userFlows state in Admin.js
};

export default ManageFlowsModal;
