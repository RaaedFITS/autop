// index.js
const express = require('express');
const http = require('http'); // Import HTTP module
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const flowRoutes = require('./routes/flows');
const pythonRoutes = require('./routes/python');
const publicUsersRoute = require('./routes/publicUsers');
const { Server } = require('socket.io'); // Import Socket.io

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Replace '*' with your frontend URL for better security (e.g., 'http://localhost:3000')
    methods: ['GET', 'POST'],
  },
});

// Middleware to make io accessible in routes/controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api', pythonRoutes);
app.use('/api/public/users', publicUsersRoute); // Public user management routes

// Root Route
app.get('/', (req, res) => {
  res.send('Parabola Backend API');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for joining a room based on user ID
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
