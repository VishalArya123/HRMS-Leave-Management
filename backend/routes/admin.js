const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const bcryptjs = require('bcryptjs');
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

// Middleware to check admin access
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Employee Management Routes
router.get('/employees', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const employees = db.prepare('SELECT id, name, email, personal_email, role, department, manager FROM employee ORDER BY name').all();
    res.json(employees);
  } catch (error) {
    console.error('❌ Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/employees', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id, name, email, personalEmail, role, department, manager } = req.body;
    const db = await getDb();
    
    // Check if employee ID already exists
    const existingEmployee = db.prepare('SELECT id FROM employee WHERE id = ?').get(id);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    
    // Check if email already exists
    const existingEmail = db.prepare('SELECT id FROM employee WHERE email = ? OR personal_email = ?').get(email, email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash default password
    const hashedPassword = await bcryptjs.hash('password123', 10);
    
    // Insert new employee
    db.prepare(`
      INSERT INTO employee (id, name, email, personal_email, password_hash, role, department, manager)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, personalEmail, hashedPassword, role, department, manager || null);
    
    // Create leave balances for new employee
    const leaveTypes = db.prepare('SELECT * FROM leave_type').all();
    const insertBalance = db.prepare(`
      INSERT INTO leave_balance (employee_id, leave_type, allocated, used, pending)
      VALUES (?, ?, ?, 0, 0)
    `);
    
    for (const leaveType of leaveTypes) {
      insertBalance.run(id, leaveType.id, leaveType.max_days);
    }
    
    const newEmployee = db.prepare('SELECT id, name, email, personal_email, role, department, manager FROM employee WHERE id = ?').get(id);
    res.json(newEmployee);
    
  } catch (error) {
    console.error('❌ Add employee error:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

router.put('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, personalEmail, role, department, manager } = req.body;
    const db = await getDb();
    
    // Check if employee exists
    const existingEmployee = db.prepare('SELECT id FROM employee WHERE id = ?').get(id);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update employee
    db.prepare(`
      UPDATE employee 
      SET name = ?, email = ?, personal_email = ?, role = ?, department = ?, manager = ?
      WHERE id = ?
    `).run(name, email, personalEmail, role, department, manager || null, id);
    
    const updatedEmployee = db.prepare('SELECT id, name, email, personal_email, role, department, manager FROM employee WHERE id = ?').get(id);
    res.json(updatedEmployee);
    
  } catch (error) {
    console.error('❌ Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Don't allow deleting admin
    if (id === 'TSG0019') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }
    
    // Check if employee exists
    const employee = db.prepare('SELECT id FROM employee WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Delete employee and related data
    db.prepare('DELETE FROM leave_balance WHERE employee_id = ?').run(id);
    db.prepare('DELETE FROM leave_request WHERE employee_id = ?').run(id);
    db.prepare('DELETE FROM employee WHERE id = ?').run(id);
    
    // Update manager references
    db.prepare('UPDATE employee SET manager = NULL WHERE manager = ?').run(id);
    
    res.json({ success: true, message: 'Employee deleted successfully' });
    
  } catch (error) {
    console.error('❌ Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Holiday Management Routes
router.get('/holidays', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const holidays = db.prepare('SELECT * FROM holiday ORDER BY date').all();
    res.json(holidays);
  } catch (error) {
    console.error('❌ Get holidays error:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

router.post('/holidays', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { date, name, type } = req.body;
    const db = await getDb();
    
    // Check if holiday already exists for this date
    const existingHoliday = db.prepare('SELECT date FROM holiday WHERE date = ?').get(date);
    if (existingHoliday) {
      return res.status(400).json({ error: 'Holiday already exists for this date' });
    }
    
    db.prepare('INSERT INTO holiday (date, name, type) VALUES (?, ?, ?)').run(date, name, type);
    
    const newHoliday = db.prepare('SELECT * FROM holiday WHERE date = ?').get(date);
    res.json(newHoliday);
    
  } catch (error) {
    console.error('❌ Add holiday error:', error);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

router.delete('/holidays/:date', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { date } = req.params;
    const db = await getDb();
    
    db.prepare('DELETE FROM holiday WHERE date = ?').run(date);
    res.json({ success: true, message: 'Holiday deleted successfully' });
    
  } catch (error) {
    console.error('❌ Delete holiday error:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

// Leave Quota Management Routes
router.get('/leave-balances', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const balances = db.prepare(`
      SELECT 
        lb.*,
        e.name as employee_name,
        lt.name as leave_type_name,
        lt.max_days
      FROM leave_balance lb
      JOIN employee e ON lb.employee_id = e.id
      JOIN leave_type lt ON lb.leave_type = lt.id
      ORDER BY e.name, lt.name
    `).all();
    res.json(balances);
  } catch (error) {
    console.error('❌ Get leave balances error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balances' });
  }
});

router.put('/leave-balances', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { employeeId, leaveType, allocated, used, pending } = req.body;
    const db = await getDb();
    
    // Check if balance entry exists
    const existingBalance = db.prepare(
      'SELECT * FROM leave_balance WHERE employee_id = ? AND leave_type = ?'
    ).get(employeeId, leaveType);
    
    if (existingBalance) {
      // Update existing balance
      db.prepare(`
        UPDATE leave_balance 
        SET allocated = ?, used = ?, pending = ?
        WHERE employee_id = ? AND leave_type = ?
      `).run(allocated, used, pending, employeeId, leaveType);
    } else {
      // Create new balance entry
      db.prepare(`
        INSERT INTO leave_balance (employee_id, leave_type, allocated, used, pending)
        VALUES (?, ?, ?, ?, ?)
      `).run(employeeId, leaveType, allocated, used, pending);
    }
    
    const updatedBalance = db.prepare(`
      SELECT 
        lb.*,
        e.name as employee_name,
        lt.name as leave_type_name
      FROM leave_balance lb
      JOIN employee e ON lb.employee_id = e.id
      JOIN leave_type lt ON lb.leave_type = lt.id
      WHERE lb.employee_id = ? AND lb.leave_type = ?
    `).get(employeeId, leaveType);
    
    res.json(updatedBalance);
    
  } catch (error) {
    console.error('❌ Update leave balance error:', error);
    res.status(500).json({ error: 'Failed to update leave balance' });
  }
});

// Admin Analytics
router.get('/analytics', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const currentYear = new Date().getFullYear();
    
    // Get employee statistics
    const employeeStats = db.prepare(`
      SELECT role, COUNT(*) as count 
      FROM employee 
      GROUP BY role
    `).all();
    
    const departmentStats = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM employee 
      WHERE department IS NOT NULL
      GROUP BY department
    `).all();
    
    // Get leave request statistics
    const leaveStats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM leave_request 
      WHERE strftime('%Y', start_date) = ?
      GROUP BY status
    `).all(currentYear.toString());
    
    // Get holiday statistics
    const holidayStats = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM holiday 
      GROUP BY type
    `).all();
    
    res.json({
      employees: {
        total: employeeStats.reduce((sum, stat) => sum + stat.count, 0),
        byRole: employeeStats.reduce((acc, stat) => {
          acc[stat.role] = stat.count;
          return acc;
        }, {}),
        byDepartment: departmentStats.reduce((acc, stat) => {
          acc[stat.department] = stat.count;
          return acc;
        }, {})
      },
      leaves: {
        total: leaveStats.reduce((sum, stat) => sum + stat.count, 0),
        byStatus: leaveStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {})
      },
      holidays: {
        total: holidayStats.reduce((sum, stat) => sum + stat.count, 0),
        byType: holidayStats.reduce((acc, stat) => {
          acc[stat.type] = stat.count;
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('❌ Get admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
