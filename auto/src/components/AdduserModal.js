// src/components/AddUserModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AddUserModal = ({ show, handleClose, handleAddUser }) => {
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      setError('All fields are required.');
      return;
    }
    handleAddUser(form);
    handleClose();
    setForm({ email: '', password: '', role: 'employee' });
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="addEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email" 
              name="email"
              placeholder="Enter email" 
              value={form.email}
              onChange={handleChange}
              required 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="addPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              name="password"
              placeholder="Enter password" 
              value={form.password}
              onChange={handleChange}
              required 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="addRole">
            <Form.Label>Role</Form.Label>
            <Form.Select 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              required
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit">Add User</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

AddUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddUser: PropTypes.func.isRequired,
};

export default AddUserModal;
