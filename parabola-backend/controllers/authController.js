// controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Registration Controller
const register = async (req, res) => {
  const { email, password, role } = req.body;

  // Input Validation
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [normalizedEmail, hashedPassword, role]
    );

    // Create JWT payload
    const payload = {
      id: result.insertId,
      email: normalizedEmail,
      role
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // Input Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (users.length === 0) {
      // User does not exist
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    // Compare passwords with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid"); // Debugging log
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.json({ token, user: payload });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login };
