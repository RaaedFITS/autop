// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import AuthContext from '../contexts/AuthContext'; // Import AuthContext
import axios from 'axios'; // Ensure Axios is imported

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); // Destructure user and logout from AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear authentication data
    navigate('/'); // Redirect to login page
  };

  return (
    <BootstrapNavbar bg="light" expand="sm" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/home">
          FITS Express - Parabola Automation
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="main-navbar" />
        <BootstrapNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            {user && user.role.toLowerCase() === 'admin' && (
              <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
            )}
           
          </Nav>
          <Nav className="align-items-center">
            {user ? (
              <>
                {/* Display Logged-in User's Email */}
                <span className="me-3 fw-semibold">Logged in as: {user.email}</span>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/">Login</Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
