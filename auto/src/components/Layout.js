// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container className="mt-4">
        {children}
      </Container>
      {/* You can add a Footer here if needed */}
    </>
  );
};

export default Layout;
