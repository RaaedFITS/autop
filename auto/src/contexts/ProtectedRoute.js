// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // User is not authenticated
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User does not have the required role
    return <Navigate to="/not-authorized" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default ProtectedRoute;
