// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext'; // Import AuthContext
import './Login.css'; // Optional: for custom styles

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Destructure login function from AuthContext

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // For showing a loading spinner

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Make a POST request to the backend login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Destructure token and user from the response data
      const { token, user } = response.data;

      // Use the login function from AuthContext to update the authentication state
      login(user, token);

      // Optionally, set the token in axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Conditional navigation based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'employee') {
        navigate('/home');
      } else {
        // Fallback for unexpected roles
        navigate('/home');
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        // Server responded with a status other than 2xx
        setMessage(error.response.data.message || 'Login failed.');
      } else if (error.request) {
        // Request was made but no response received
        setMessage('No response from server. Please try again later.');
      } else {
        // Something else happened
        setMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="shadow-lg p-4" style={{ width: '400px', borderRadius: '10px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back</h2>
            <p>Please log in to continue</p>
          </div>
          {message && <Alert variant="danger" className="text-center">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* Email */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                placeholder="Enter your email" 
                value={credentials.email}
                onChange={handleChange}
                required 
              />
            </Form.Group>
            {/* Password */}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                placeholder="Enter your password" 
                value={credentials.password}
                onChange={handleChange}
                required 
              />
            </Form.Group>
            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
