// src/components/AddFlowModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';

const AddFlowModal = ({ show, handleClose, refreshFlows }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleAddFlow = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Flow name is required.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/flows', { name, description });
      alert('Flow added successfully.');
      setName('');
      setDescription('');
      handleClose();
      refreshFlows();
    } catch (err) {
      console.error('Add Flow Error:', err);
      setError(err.response?.data?.message || 'Failed to add flow.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleAddFlow}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Flow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="flowName">
            <Form.Label>Flow Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter flow name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="flowDescription">
            <Form.Label>Flow Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Enter flow description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit">Add Flow</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

AddFlowModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  refreshFlows: PropTypes.func.isRequired,
};

export default AddFlowModal;
