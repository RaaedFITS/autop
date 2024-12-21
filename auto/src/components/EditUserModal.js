// src/components/EditUserModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const EditUserModal = ({ show, handleClose, user, handleEditUser }) => {
  const [form, setForm] = useState({ id: user.id, email: user.email, role: user.role, password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ id: user.id, email: user.email, role: user.role, password: '' });
    setError('');
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.role) {
      setError('Email and Role are required.');
      return;
    }
    // Prepare the updated user data
    const updatedUser = { 
      id: form.id, 
      email: form.email, 
      role: form.role, 
    };
    if (form.password.trim() !== '') {
      updatedUser.password = form.password;
    }
    handleEditUser(updatedUser);
    handleClose();
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="editUserId">
            <Form.Label>User ID</Form.Label>
            <Form.Control 
              type="text" 
              name="id"
              value={form.id}
              readOnly 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editEmail">
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
          <Form.Group className="mb-3" controlId="editPassword">
            <Form.Label>Password (Leave blank to keep current)</Form.Label>
            <Form.Control 
              type="password" 
              name="password"
              placeholder="Enter new password" 
              value={form.password}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editRole">
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
          <Button variant="warning" type="submit">Update User</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

EditUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  handleEditUser: PropTypes.func.isRequired,
};

export default EditUserModal;
