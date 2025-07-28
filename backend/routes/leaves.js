const express = require('express');
const cors = require('cors');
const getDb = require('../utils/db');
const { authMiddleware } = require('../utils/auth');
const { validStatuses, MAX_LOP_PER_YEAR } = require('../utils/constants');
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
    message: 'Leave routes working', 
    timestamp: new Date().toISOString() 
  });
});

// Get all leaves for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Getting leaves for user:', req.user.id);
    
    const db = await getDb();
    const leaves = db.prepare('SELECT * FROM leave_request WHERE employee_id=? ORDER BY applied_date DESC').all(req.user.id);
    
    console.log('✅ Found leaves:', leaves.length);
    res.json(leaves);
    
  } catch (error) {
    console.error('❌ Get leaves error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaves', 
      details: error.message 
    });
  }
});

// Get leaves to approve
router.get('/approvals', authMiddleware, async (req, res) => {
  try {
    console.log('👔 Getting approvals for user:', req.user.id);
    
    const db = await getDb();
    const approvals = db.prepare('SELECT * FROM leave_request WHERE approver=? AND status="pending" ORDER BY applied_date DESC').all(req.user.id);
    
    console.log('✅ Found pending approvals:', approvals.length);
    res.json(approvals);
    
  } catch (error) {
    console.error('❌ Get approvals error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch approvals', 
      details: error.message 
    });
  }
});

// Submit new leave request
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Creating leave request for user:', req.user.id);
    console.log('📝 Request data:', req.body);
    
    const { id, leaveType, startDate, endDate, days, reason, hasConflicts, conflictDetails } = req.body;
    
    if (!id || !leaveType || !startDate || !endDate || !days || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDb();

    // Find approver based on role
    const emp = db.prepare('SELECT * FROM employee WHERE id=?').get(req.user.id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    let approverId = null;
    
    if (emp.role === 'employee') {
      approverId = emp.manager;
    } else if (emp.role === 'manager') {
      const admin = db.prepare('SELECT id FROM employee WHERE role="admin" LIMIT 1').get();
      approverId = admin?.id;
    } else {
      return res.status(400).json({ error: 'Admins cannot request leave through this endpoint' });
    }

    if (!approverId) {
      return res.status(400).json({ error: 'No approver found for this employee' });
    }

    // Calculate LOP
    const balance = db.prepare('SELECT * FROM leave_balance WHERE employee_id=? AND leave_type=?').get(req.user.id, leaveType);
    
    let lopDays = 0;
    let availableDays = 0;
    
    if (balance) {
      availableDays = balance.allocated - balance.used - balance.pending;
      lopDays = Math.max(0, days - availableDays);
    } else {
      lopDays = days;
    }

    // Check annual LOP limit
    const currentYear = new Date().getFullYear();
    const totalLopUsed = db.prepare(`
      SELECT SUM(lop_days) as total FROM leave_request 
      WHERE employee_id=? AND status="approved" AND strftime('%Y', start_date)=?
    `).get(req.user.id, currentYear.toString());
    
    const currentLop = totalLopUsed?.total || 0;
    if (currentLop + lopDays > MAX_LOP_PER_YEAR) {
      return res.status(400).json({ 
        error: `Would exceed annual LOP limit. Current: ${currentLop}, Limit: ${MAX_LOP_PER_YEAR}` 
      });
    }

    // Insert leave request
    const appliedDate = new Date().toISOString().slice(0, 10);
    db.prepare(`
      INSERT INTO leave_request 
      (id, employee_id, leave_type, start_date, end_date, days, reason, status, applied_date, approver, lop_days, is_lop, has_conflicts, conflict_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, "pending", ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, leaveType, startDate, endDate, days, reason, appliedDate, approverId, lopDays, lopDays > 0, hasConflicts || false, conflictDetails || '');

    // Update pending balance if not LOP
    if (balance && lopDays < days) {
      const pendingDays = Math.min(days, availableDays);
      db.prepare('UPDATE leave_balance SET pending=pending+? WHERE employee_id=? AND leave_type=?')
        .run(pendingDays, req.user.id, leaveType);
    }

    const newRequest = db.prepare('SELECT * FROM leave_request WHERE id=?').get(id);
    console.log('✅ Leave request created:', newRequest.id);
    
    res.json({
      success: true,
      request: newRequest,
      lopDays,
      approver: approverId
    });

  } catch (error) {
    console.error('❌ Create leave request error:', error);
    res.status(500).json({ 
      error: 'Failed to create leave request', 
      details: error.message 
    });
  }
});

// Cancel leave request
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    console.log('❌ Cancelling leave request:', req.params.id);
    
    const db = await getDb();
    const request = db.prepare('SELECT * FROM leave_request WHERE id=?').get(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.employee_id !== req.user.id) {
      return res.status(403).json({ error: 'Can only cancel your own requests' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be cancelled' });
    }
    
    if (new Date(request.start_date) <= new Date()) {
      return res.status(400).json({ error: 'Cannot cancel after start date' });
    }

    db.prepare('UPDATE leave_request SET status="cancelled", comments=? WHERE id=?')
      .run(`Cancelled by employee on ${new Date().toISOString().slice(0, 10)}`, req.params.id);

    // Adjust pending balance if not LOP
    if (!request.is_lop) {
      db.prepare('UPDATE leave_balance SET pending=pending-? WHERE employee_id=? AND leave_type=?')
        .run(request.days, request.employee_id, request.leave_type);
    }

    const updatedRequest = db.prepare('SELECT * FROM leave_request WHERE id=?').get(req.params.id);
    console.log('✅ Leave request cancelled:', req.params.id);
    
    res.json({
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error('❌ Cancel leave request error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel leave request', 
      details: error.message 
    });
  }
});

// Approve or reject leave
router.post('/:id/decision', authMiddleware, async (req, res) => {
  try {
    console.log('⚖️ Processing decision for leave:', req.params.id);
    
    const { action, comments, rejectionReason } = req.body;
    const db = await getDb();
    const request = db.prepare('SELECT * FROM leave_request WHERE id=?').get(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.approver !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to approve this request' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    if (action === 'approve') {
      db.prepare('UPDATE leave_request SET status="approved", comments=? WHERE id=?')
        .run(comments || `Approved by ${req.user.name}`, req.params.id);
      
      // Update leave balance if not LOP
      if (!request.is_lop) {
        db.prepare('UPDATE leave_balance SET used=used+?, pending=pending-? WHERE employee_id=? AND leave_type=?')
          .run(request.days, request.days, request.employee_id, request.leave_type);
      }
      
    } else if (action === 'reject') {
      db.prepare('UPDATE leave_request SET status="rejected", comments=?, rejection_reason=? WHERE id=?')
        .run(comments || `Rejected by ${req.user.name}`, rejectionReason || '', req.params.id);
      
      // Remove from pending if not LOP
      if (!request.is_lop) {
        db.prepare('UPDATE leave_balance SET pending=pending-? WHERE employee_id=? AND leave_type=?')
          .run(request.days, request.employee_id, request.leave_type);
      }
      
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    const updatedRequest = db.prepare('SELECT * FROM leave_request WHERE id=?').get(req.params.id);
    console.log(`✅ Leave request ${action}d:`, req.params.id);
    
    res.json({
      success: true,
      action,
      request: updatedRequest
    });

  } catch (error) {
    console.error('❌ Decision processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process decision', 
      details: error.message 
    });
  }
});

module.exports = router;
