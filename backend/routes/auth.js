const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const bcryptjs = require('bcryptjs');
const { generateToken } = require('../utils/auth');
const router = express.Router();

// CORS options for auth routes
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'https://hrms-leave-management-vishal.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

router.use(cors(corsOptions));

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const db = await getDb();
    const user = db.prepare('SELECT * FROM employee WHERE email=? OR personal_email=?').get(email, email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const match = await bcryptjs.compare(password, user.password_hash);
    if (!match) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Remove password from response
    delete user.password_hash;
    
    const token = generateToken(user);
    
    console.log('✅ Login successful for:', user.name);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        personalEmail: user.personal_email,
        role: user.role,
        department: user.department,
        manager: user.manager
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  console.log('🚪 Logout request');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ valid: true, user: decoded });
    
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(401).json({ error: 'Token verification failed' });
  }
});

module.exports = router;
