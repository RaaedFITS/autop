// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Authenticate Token Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token format: 'Bearer TOKEN'
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ message: 'Invalid Access Token' });
    }
    req.user = user; // Attach user info to request
    next();
  });
};

// Authorize Roles Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
