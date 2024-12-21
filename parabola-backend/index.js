// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const flowRoutes = require('./routes/flows');
const pythonRoutes = require('./routes/python');
const publicUsersRoute = require('./routes/publicUsers');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/python', pythonRoutes);
app.use('/api/public/users', publicUsersRoute); // Public user management routes

// Root Route
app.get('/', (req, res) => {
  res.send('Parabola Backend API');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
