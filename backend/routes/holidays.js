const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const { authMiddleware } = require('../utils/auth');
const router = express.Router();

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'https://hrms-leave-management-vishal.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

router.use(cors(corsOptions));

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Holiday routes working', 
    timestamp: new Date().toISOString() 
  });
});

// Get all holidays
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🏖️ Getting holidays for user:', req.user.id);
    
    const db = await getDb();
    const holidays = db.prepare('SELECT * FROM holiday ORDER BY date').all();
    
    console.log('✅ Found holidays:', holidays.length);
    res.json(holidays);
    
  } catch (error) {
    console.error('❌ Get holidays error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch holidays', 
      details: error.message 
    });
  }
});

// Get holidays by year
router.get('/year/:year', authMiddleware, async (req, res) => {
  try {
    const year = req.params.year;
    console.log('📅 Getting holidays for year:', year);
    
    const db = await getDb();
    const holidays = db.prepare('SELECT * FROM holiday WHERE strftime("%Y", date) = ? ORDER BY date').all(year);
    
    console.log('✅ Found holidays for', year + ':', holidays.length);
    res.json(holidays);
    
  } catch (error) {
    console.error('❌ Get holidays by year error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch holidays by year', 
      details: error.message 
    });
  }
});

// Get upcoming holidays (next 30 days)
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    console.log('⏭️ Getting upcoming holidays');
    
    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    const holidays = db.prepare('SELECT * FROM holiday WHERE date >= ? AND date <= ? ORDER BY date').all(today, thirtyDaysLater);
    
    console.log('✅ Found upcoming holidays:', holidays.length);
    res.json(holidays);
    
  } catch (error) {
    console.error('❌ Get upcoming holidays error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming holidays', 
      details: error.message 
    });
  }
});

module.exports = router;
