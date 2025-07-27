const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const { authMiddleware } = require('../utils/auth');
const { MAX_LOP_PER_YEAR } = require('../utils/constants');
const router = express.Router();

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

router.use(cors(corsOptions));

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Analytics routes working', 
    timestamp: new Date().toISOString() 
  });
});

// Get LOP analytics for current user
router.get('/lop', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Getting LOP analytics for user:', req.user.id);
    
    const db = await getDb();
    const currentYear = new Date().getFullYear();
    
    // Get total LOP days for current year
    const lopData = await db.get(`
      SELECT SUM(lop_days) as totalLOP 
      FROM leave_request 
      WHERE employee_id = ? AND status = "approved" AND strftime('%Y', start_date) = ?
    `, req.user.id, currentYear.toString());

    // Get LOP breakdown by leave type
    const lopBreakdown = await db.all(`
      SELECT leave_type, SUM(lop_days) as lop_days 
      FROM leave_request 
      WHERE employee_id = ? AND status = "approved" AND lop_days > 0 AND strftime('%Y', start_date) = ?
      GROUP BY leave_type
    `, req.user.id, currentYear.toString());

    const totalLOPDays = lopData?.totalLOP || 0;
    const remainingLOPDays = Math.max(0, MAX_LOP_PER_YEAR - totalLOPDays);

    const result = {
      totalLOPDays,
      lopBreakdown: lopBreakdown.reduce((acc, item) => {
        acc[item.leave_type] = item.lop_days;
        return acc;
      }, {}),
      maxLOPPerYear: MAX_LOP_PER_YEAR,
      remainingLOPDays,
      lopUtilizationPercent: Math.round((totalLOPDays / MAX_LOP_PER_YEAR) * 100)
    };

    console.log('✅ LOP Analytics result:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ LOP Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LOP analytics', 
      details: error.message 
    });
  }
});

// Get leave summary for current user
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    console.log('📈 Getting leave summary for user:', req.user.id);
    
    const db = await getDb();
    const currentYear = new Date().getFullYear();

    // Total leaves taken this year
    const totalLeaves = await db.get(`
      SELECT COUNT(*) as count, SUM(days) as totalDays
      FROM leave_request 
      WHERE employee_id = ? AND status = "approved" AND strftime('%Y', start_date) = ?
    `, req.user.id, currentYear.toString());

    // Pending leaves
    const pendingLeaves = await db.get(`
      SELECT COUNT(*) as count 
      FROM leave_request 
      WHERE employee_id = ? AND status = "pending"
    `, req.user.id);

    // Leave balances
    const balances = await db.all(`
      SELECT * FROM leave_balance WHERE employee_id = ?
    `, req.user.id);

    const result = {
      totalLeavesApproved: totalLeaves?.count || 0,
      totalDaysApproved: totalLeaves?.totalDays || 0,
      pendingRequests: pendingLeaves?.count || 0,
      leaveBalances: balances,
      year: currentYear
    };

    console.log('✅ Leave summary result:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ Leave summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leave summary', 
      details: error.message 
    });
  }
});

// Get team analytics (for managers)
router.get('/team', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Manager or admin access required' });
    }

    console.log('👥 Getting team analytics for:', req.user.id);
    
    const db = await getDb();
    const currentYear = new Date().getFullYear();

    let teamCondition = '';
    let params = [currentYear.toString()];
    
    if (req.user.role === 'manager') {
      teamCondition = 'AND e.manager = ?';
      params.push(req.user.id);
    }

    // Team leave statistics
    const teamStats = await db.all(`
      SELECT 
        e.id, e.name, e.department,
        COUNT(lr.id) as total_requests,
        SUM(CASE WHEN lr.status = 'approved' THEN lr.days ELSE 0 END) as approved_days,
        SUM(CASE WHEN lr.status = 'pending' THEN 1 ELSE 0 END) as pending_requests
      FROM employee e
      LEFT JOIN leave_request lr ON e.id = lr.employee_id AND strftime('%Y', lr.start_date) = ?
      WHERE 1=1 ${teamCondition}
      GROUP BY e.id, e.name, e.department
      ORDER BY e.name
    `, params);

    console.log('✅ Team analytics result:', teamStats.length, 'team members');
    res.json(teamStats);

  } catch (error) {
    console.error('❌ Team analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team analytics', 
      details: error.message 
    });
  }
});

module.exports = router;
