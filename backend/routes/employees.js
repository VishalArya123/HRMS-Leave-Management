const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const { authMiddleware } = require('../utils/auth');
const router = express.Router();

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

router.use(cors(corsOptions));

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Employee routes working', 
    timestamp: new Date().toISOString() 
  });
});

// Get all employees
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('👥 Getting all employees for user:', req.user.id);
    
    const db = await getDb();
    const employees = await db.all(
      'SELECT id, name, email, personal_email, role, department, manager FROM employee ORDER BY name'
    );
    
    console.log('✅ Found employees:', employees.length);
    res.json(employees);
    
  } catch (error) {
    console.error('❌ Get employees error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees', 
      details: error.message 
    });
  }
});

// Get employee by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('👤 Getting employee:', req.params.id);
    
    const db = await getDb();
    const employee = await db.get(
      'SELECT id, name, email, personal_email, role, department, manager FROM employee WHERE id = ?', 
      req.params.id
    );
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    console.log('✅ Found employee:', employee.name);
    res.json(employee);
    
  } catch (error) {
    console.error('❌ Get employee error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employee', 
      details: error.message 
    });
  }
});

// Get employee's leave balances
router.get('/:id/balances', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Getting leave balances for employee:', req.params.id);
    
    const db = await getDb();
    const balances = await db.all(
      'SELECT * FROM leave_balance WHERE employee_id = ?', 
      req.params.id
    );
    
    console.log('✅ Found balances:', balances.length);
    res.json(balances);
    
  } catch (error) {
    console.error('❌ Get balances error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leave balances', 
      details: error.message 
    });
  }
});

// Get team members (for managers)
router.get('/team/:managerId', authMiddleware, async (req, res) => {
  try {
    console.log('👥 Getting team members for manager:', req.params.managerId);
    
    const db = await getDb();
    const teamMembers = await db.all(
      'SELECT id, name, email, personal_email, role, department FROM employee WHERE manager = ?', 
      req.params.managerId
    );
    
    console.log('✅ Found team members:', teamMembers.length);
    res.json(teamMembers);
    
  } catch (error) {
    console.error('❌ Get team members error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team members', 
      details: error.message 
    });
  }
});

module.exports = router;
