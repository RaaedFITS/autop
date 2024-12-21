// src/pages/Admin.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import AddUserModal from '../components/AdduserModal'; // Corrected import case
import EditUserModal from '../components/EditUserModal';
import ManageFlowsModal from '../components/ManageFlowsModal';
import AuthContext from '../contexts/AuthContext';
import FlowsManagementModal from '../components/FlowsManagementModal'; // New import

import axios from 'axios';

const Admin = () => {
  const { token } = useContext(AuthContext); // Access the JWT token
  const [users, setUsers] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showManageFlowsModal, setShowManageFlowsModal] = useState(false);
  
  const [showFlowsManagementModal, setShowFlowsManagementModal] = useState(false); // New state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserFlows, setCurrentUserFlows] = useState([]);

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get('http://localhost:5000/api/public/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetch Users Response:', response.data); // Debugging line
      setUsers(response.data.users); // Adjust based on API response
    } catch (err) {
      console.error('Fetch Users Error:', err); // Debugging line
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Flows
  const fetchFlows = async () => {
    setLoadingFlows(true);
    try {
      const response = await axios.get('http://localhost:5000/api/flows', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetch Flows Response:', response.data); // Debugging line
      setFlows(response.data.flows); // Adjust based on API response
    } catch (err) {
      console.error('Fetch Flows Error:', err); // Debugging line
      setError(err.response?.data?.message || 'Failed to fetch flows.');
    } finally {
      setLoadingFlows(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Add User
  const handleAddUser = async (newUser) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Add User Response:', response.data); // Debugging line
      setUsers([...users, response.data.user]); // Adjust based on API response
      setSuccess('User added successfully.');
    } catch (err) {
      console.error('Add User Error:', err); // Debugging line
      setError(err.response?.data?.message || 'Failed to add user.');
    }
  };

  // Handle Edit User
  const handleEditUser = async (updatedUser) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/public/users/${updatedUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Update User Response:', response.data); // Debugging line
      if (response.data.user) {
        setUsers(users.map(user => user.id === updatedUser.id ? response.data.user : user));
        setSuccess('User updated successfully.');
      } else {
        setError('Updated user data is missing from the response.');
      }
    } catch (err) {
      console.error('Edit User Error:', err); // Debugging line
      setError(err.response?.data?.message || 'Failed to update user.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/public/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(users.filter(user => user.id !== id));
        setSuccess('User deleted successfully.');
      } catch (err) {
        console.error('Delete User Error:', err); // Debugging line
        setError(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  // Handle Manage Flows
  const handleManageFlows = async (user) => {
    setCurrentUser(user);
    try {
      const response = await axios.get(`http://localhost:5000/api/public/users/${user.id}/flows`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Manage Flows Response:', response.data); // Debugging line
      setCurrentUserFlows(response.data.flows.map(flow => flow.id)); // Adjust based on API response
      setShowManageFlowsModal(true);
    } catch (err) {
      console.error('Manage Flows Error:', err); // Debugging line
      setError(err.response?.data?.message || 'Failed to fetch user flows.');
    }
  };

  return (
    <>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Admin Panel</h1>
          <div>
            <Button variant="primary" onClick={() => setShowAddUserModal(true)}>Add User</Button>
            <Button variant="secondary" className="ms-2" onClick={() => setShowFlowsManagementModal(true)}>

Manage Flows

</Button>
          </div>
        </div>

        {/* Display Success Messages */}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        {/* Display Error Messages */}
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        {loadingUsers ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : users.length > 0 ? (
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
              {users.filter(user => user).map(user => (
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
          setUserFlows={setCurrentUserFlows} // Pass the setter function
        />
      )}
      {/* Flows Management Modal (CRUD Operations) */}

      <FlowsManagementModal 

        show={showFlowsManagementModal} 

        handleClose={() => setShowFlowsManagementModal(false)} 

        flows={flows} 

        refreshFlows={fetchFlows}

      />
    </>
  );
};

export default Admin;
