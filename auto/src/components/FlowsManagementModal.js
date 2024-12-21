// src/components/FlowsManagementModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Alert, Form, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';

const FlowsManagementModal = ({ show, handleClose }) => {
  const [flows, setFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [error, setError] = useState('');
  const [addFlowError, setAddFlowError] = useState('');
  const [success, setSuccess] = useState('');

  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');

  // Fetch flows when the modal is shown
  useEffect(() => {
    if (show) {
      fetchFlows();
    }
  }, [show]);

  const fetchFlows = async () => {
    setLoadingFlows(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/flows');
      setFlows(response.data.flows);
    } catch (err) {
      console.error('Fetch Flows Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch flows.');
    } finally {
      setLoadingFlows(false);
    }
  };

  const handleAddFlow = async (e) => {
    e.preventDefault();
    setAddFlowError('');
    setSuccess('');

    if (!newFlowName.trim()) {
      setAddFlowError('Flow name is required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/flows', {
        name: newFlowName.trim(),
        description: newFlowDescription.trim(),
      });

      setSuccess('Flow added successfully.');
      setNewFlowName('');
      setNewFlowDescription('');
      fetchFlows(); // Refresh the flows list
    } catch (err) {
      console.error('Add Flow Error:', err);
      setAddFlowError(err.response?.data?.message || 'Failed to add flow.');
    }
  };

  const handleDeleteFlow = async (flowId) => {
    if (window.confirm('Are you sure you want to delete this flow?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/flows/${flowId}`);
        alert(response.data.message || 'Flow deleted successfully.');
        fetchFlows(); // Refresh the flows list
      } catch (err) {
        console.error('Delete Flow Error:', err);
        alert(err.response?.data?.message || 'Failed to delete flow.');
      }
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Flows</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display general errors */}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

          {/* Add New Flow Form */}
          <h5>Add New Flow</h5>
          <Form onSubmit={handleAddFlow} className="mb-4">
            {addFlowError && <Alert variant="danger" onClose={() => setAddFlowError('')} dismissible>{addFlowError}</Alert>}
            <Form.Group className="mb-3" controlId="flowName">
              <Form.Label>Flow Name <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter flow name" 
                value={newFlowName} 
                onChange={(e) => setNewFlowName(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="flowDescription">
              <Form.Label>Flow Description (optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter flow description" 
                value={newFlowDescription} 
                onChange={(e) => setNewFlowDescription(e.target.value)} 
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Flow
            </Button>
          </Form>

          <hr />

          {/* Display Flows */}
          <h5>Existing Flows</h5>
          {loadingFlows ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : flows.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.map(flow => (
                    <tr key={flow.id}>
                      <td>{flow.id}</td>
                      <td>{flow.name}</td>
                      <td>{flow.description || '-'}</td>
                      <td className="text-end">
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteFlow(flow.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p>No flows available. Add a new flow using the form above.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

FlowsManagementModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FlowsManagementModal;
