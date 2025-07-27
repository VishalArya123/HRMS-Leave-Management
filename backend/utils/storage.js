const getDb = require('./db');

class StorageManager {
  // Employee operations
  async getEmployees() {
    const db = await getDb();
    return await db.all('SELECT id, name, email, personal_email, role, department, manager FROM employee');
  }

  async getEmployeeById(id) {
    const db = await getDb();
    return await db.get('SELECT id, name, email, personal_email, role, department, manager FROM employee WHERE id = ?', id);
  }

  async getEmployeeByEmail(email) {
    const db = await getDb();
    return await db.get('SELECT * FROM employee WHERE email = ? OR personal_email = ?', email, email);
  }

  // Leave types operations
  async getLeaveTypes() {
    const db = await getDb();
    return await db.all('SELECT * FROM leave_type');
  }

  // Holiday operations
  async getHolidays() {
    const db = await getDb();
    return await db.all('SELECT * FROM holiday ORDER BY date');
  }

  // Leave balance operations
  async getLeaveBalances(employeeId) {
    const db = await getDb();
    return await db.all('SELECT * FROM leave_balance WHERE employee_id = ?', employeeId);
  }

  async updateLeaveBalance(employeeId, leaveType, usedDelta, pendingDelta = 0) {
    const db = await getDb();
    await db.run(
      'UPDATE leave_balance SET used = used + ?, pending = pending + ? WHERE employee_id = ? AND leave_type = ?',
      usedDelta, pendingDelta, employeeId, leaveType
    );
  }

  // Leave request operations
  async getLeaveRequests(employeeId = null) {
    const db = await getDb();
    if (employeeId) {
      return await db.all('SELECT * FROM leave_request WHERE employee_id = ? ORDER BY applied_date DESC', employeeId);
    }
    return await db.all('SELECT * FROM leave_request ORDER BY applied_date DESC');
  }

  async getPendingRequestsForApprover(approverId) {
    const db = await getDb();
    return await db.all('SELECT * FROM leave_request WHERE approver = ? AND status = "pending"', approverId);
  }

  async addLeaveRequest(requestData) {
    const db = await getDb();
    const { id, employeeId, leaveType, startDate, endDate, days, reason, approver, lopDays = 0, isLop = false, hasConflicts = false, conflictDetails = '' } = requestData;
    
    await db.run(`
      INSERT INTO leave_request (id, employee_id, leave_type, start_date, end_date, days, reason, status, applied_date, approver, lop_days, is_lop, has_conflicts, conflict_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, "pending", ?, ?, ?, ?, ?, ?)
    `, id, employeeId, leaveType, startDate, endDate, days, reason, new Date().toISOString().slice(0, 10), approver, lopDays, isLop, hasConflicts, conflictDetails);

    return await db.get('SELECT * FROM leave_request WHERE id = ?', id);
  }

  async updateLeaveRequestStatus(id, status, comments = '', rejectionReason = '') {
    const db = await getDb();
    await db.run(
      'UPDATE leave_request SET status = ?, comments = ?, rejection_reason = ? WHERE id = ?',
      status, comments, rejectionReason, id
    );
    return await db.get('SELECT * FROM leave_request WHERE id = ?', id);
  }

  async cancelLeaveRequest(id, userId) {
    const db = await getDb();
    const request = await db.get('SELECT * FROM leave_request WHERE id = ?', id);
    
    if (!request) throw new Error('Leave request not found');
    if (request.employee_id !== userId) throw new Error('Unauthorized');
    if (request.status !== 'pending') throw new Error('Only pending requests can be cancelled');
    if (new Date(request.start_date) <= new Date()) throw new Error('Cannot cancel after start date');

    await db.run(
      'UPDATE leave_request SET status = "cancelled", comments = ? WHERE id = ?',
      `Cancelled by employee on ${new Date().toISOString().slice(0, 10)}`, id
    );

    // Adjust pending balance if not LOP
    if (!request.is_lop) {
      await this.updateLeaveBalance(request.employee_id, request.leave_type, 0, -request.days);
    }

    return await db.get('SELECT * FROM leave_request WHERE id = ?', id);
  }

  // Analytics operations
  async getLOPAnalytics(employeeId) {
    const db = await getDb();
    const currentYear = new Date().getFullYear();
    
    const lopData = await db.get(`
      SELECT SUM(lop_days) as totalLOP 
      FROM leave_request 
      WHERE employee_id = ? AND status = "approved" AND strftime('%Y', start_date) = ?
    `, employeeId, currentYear.toString());

    const lopBreakdown = await db.all(`
      SELECT leave_type, SUM(lop_days) as lop_days 
      FROM leave_request 
      WHERE employee_id = ? AND status = "approved" AND lop_days > 0 AND strftime('%Y', start_date) = ?
      GROUP BY leave_type
    `, employeeId, currentYear.toString());

    return {
      totalLOPDays: lopData.totalLOP || 0,
      lopBreakdown: lopBreakdown.reduce((acc, item) => {
        acc[item.leave_type] = item.lop_days;
        return acc;
      }, {}),
      maxLOPPerYear: 10,
      remainingLOPDays: 10 - (lopData.totalLOP || 0)
    };
  }

  // Conflict detection
  async checkLeaveConflicts(employeeId, startDate, endDate, excludeRequestId = null) {
    const db = await getDb();
    let query = `
      SELECT * FROM leave_request 
      WHERE employee_id = ? 
      AND (status = "approved" OR status = "pending")
      AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))
    `;
    let params = [employeeId, endDate, startDate, startDate, startDate, endDate, endDate, startDate, endDate];

    if (excludeRequestId) {
      query += ' AND id != ?';
      params.push(excludeRequestId);
    }

    return await db.all(query, ...params);
  }

  // Notification operations
  async getNotifications() {
    const db = await getDb();
    return await db.all('SELECT * FROM notification ORDER BY id DESC');
  }

  async addNotification(message, type, priority) {
    const db = await getDb();
    await db.run(
      'INSERT INTO notification (message, type, priority) VALUES (?, ?, ?)',
      message, type, priority
    );
  }
}

module.exports = new StorageManager();
