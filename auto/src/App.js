// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Layout from './components/Layout'; // Adjusted path
import ProtectedRoute from "./contexts/ProtectedRoute"; // Corrected path
import { AuthProvider } from "./contexts/AuthContext"; // Corrected import
import NotAuthorized from "./pages/NotAuthorized"; // Adjusted path

function App() {
  return (
    <Router>
      <AuthProvider> {/* Correctly wrapping with AuthProvider */}
        <Layout>
          <Routes>
            {/* Public Route: Login */}
            <Route path="/" element={<Login />} />

            {/* Protected Route: Home (Accessible by both admin and employee) */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />

            {/* Protected Route: Admin (Accessible by admin only) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Public Route: Not Authorized */}
            <Route path="/not-authorized" element={<NotAuthorized />} />

            {/* Redirect any unknown routes to Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
