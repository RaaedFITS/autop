// src/pages/NotAuthorized.js
import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Access Denied</Alert.Heading>
        <p>You do not have permission to view this page.</p>
        <Button variant="primary" onClick={handleGoHome}>
          Go to Home
        </Button>
      </Alert>
    </Container>
  );
};

export default NotAuthorized;
