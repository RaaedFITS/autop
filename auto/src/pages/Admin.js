// src/pages/Admin.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Container, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';

const Admin = () => {
  // Dummy data for users and flows
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01 10:00' },
    { id: 2, email: 'employee@example.com', role: 'employee', createdAt: '2024-02-15 14:30' },
  ]);

  const [flows, setFlows] = useState([
    { id: 1, name: 'Flow A', description: 'Description for Flow A' },
    { id: 2, name: 'Flow B', description: 'Description for Flow B' },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showManageFlowsModal, setShowManageFlowsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserFlows, setCurrentUserFlows] = useState([]);

  const handleAddUser = (newUser) => {
    setUsers([...users, { ...newUser, id: users.length + 1, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }]);
  };

  const handleEditUser = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleManageFlows = (user) => {
    setCurrentUser(user);
    // For simplicity, let's assume user has flows with IDs 1 and 2
    setCurrentUserFlows([1]); // Dummy data
    setShowManageFlowsModal(true);
  };

  return (
    <>
    
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Admin Panel</h1>
          <div>
            <Button variant="primary" onClick={() => setShowAddUserModal(true)}>Add User</Button>
            <Button variant="secondary" className="ms-2" onClick={() => alert('Manage Flows functionality not implemented yet.')}>Manage Flows</Button>
          </div>
        </div>

        {/* Alert for messages */}
        {/* Replace with dynamic messages when backend is connected */}
        {false && <Alert variant="info">This is an info alert</Alert>}

        {users.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    {user.role.toLowerCase() === 'admin' ? (
                      <Badge bg="danger">Admin</Badge>
                    ) : (
                      <Badge bg="secondary">Employee</Badge>
                    )}
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="text-end">
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => { setCurrentUser(user); setShowEditUserModal(true); }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="info" 
                      size="sm" 
                      onClick={() => handleManageFlows(user)}
                    >
                      Manage Flows
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">No users found. Add a new user using the button above.</Alert>
        )}
      </Container>

      {/* Add User Modal */}
      <AddUserModal 
        show={showAddUserModal} 
        handleClose={() => setShowAddUserModal(false)} 
        handleAddUser={handleAddUser} 
      />

      {/* Edit User Modal */}
      {currentUser && (
        <EditUserModal 
          show={showEditUserModal} 
          handleClose={() => setShowEditUserModal(false)} 
          user={currentUser} 
          handleEditUser={handleEditUser} 
        />
      )}

      {/* Manage Flows Modal */}
      {currentUser && (
        <ManageFlowsModal 
          show={showManageFlowsModal} 
          handleClose={() => setShowManageFlowsModal(false)} 
          user={currentUser} 
          flows={flows} 
          userFlows={currentUserFlows}
          setUserFlows={setCurrentUserFlows}
        />
      )}
    </>
  );
};

// Add User Modal Component
const AddUserModal = ({ show, handleClose, handleAddUser }) => {
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddUser(form);
    handleClose();
    setForm({ email: '', password: '', role: 'employee' });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

// Edit User Modal Component
const EditUserModal = ({ show, handleClose, user, handleEditUser }) => {
  const [form, setForm] = useState({ id: user.id, email: user.email, role: user.role, password: '' });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If password is left blank, keep the current password (dummy)
    const updatedUser = { 
      id: form.id, 
      email: form.email, 
      role: form.role, 
      createdAt: user.createdAt 
    };
    handleEditUser(updatedUser);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

// Manage Flows Modal Component
const ManageFlowsModal = ({ show, handleClose, user, flows, userFlows, setUserFlows }) => {
  const [selectedFlows, setSelectedFlows] = useState(userFlows);

  const handleCheckboxChange = (e) => {
    const flowId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedFlows([...selectedFlows, flowId]);
    } else {
      setSelectedFlows(selectedFlows.filter(id => id !== flowId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user flows (dummy)
    setUserFlows(selectedFlows);
    handleClose();
    // Optionally, update the user state in Admin page
    alert(`Flows updated for user ${user.email}`);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Flows for {user.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {flows.length > 0 ? (
            flows.map(flow => (
              <Form.Check 
                key={flow.id}
                type="checkbox"
                label={`${flow.name} - ${flow.description}`}
                value={flow.id}
                checked={selectedFlows.includes(flow.id)}
                onChange={handleCheckboxChange}
              />
            ))
          ) : (
            <p>No flows available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save Flows</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Admin;
