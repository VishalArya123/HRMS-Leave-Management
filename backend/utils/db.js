const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../db/hrms.db');
let dbConnection = null;

async function getDb() {
  if (!dbConnection) {
    try {
      dbConnection = await open({ 
        filename: dbPath, 
        driver: sqlite3.Database 
      });
      console.log('📁 Database connected successfully');
      await initializeDatabase();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return dbConnection;
}

async function initializeDatabase() {
  const db = dbConnection;
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS employee (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      personal_email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      manager TEXT,
      FOREIGN KEY(manager) REFERENCES employee(id)
    );

    CREATE TABLE IF NOT EXISTS leave_balance (
      employee_id TEXT,
      leave_type TEXT,
      allocated INTEGER,
      used INTEGER DEFAULT 0,
      pending INTEGER DEFAULT 0,
      PRIMARY KEY (employee_id, leave_type),
      FOREIGN KEY(employee_id) REFERENCES employee(id)
    );

    CREATE TABLE IF NOT EXISTS leave_type (
      id TEXT PRIMARY KEY,
      name TEXT,
      code TEXT,
      color TEXT,
      max_days INTEGER,
      carry_forward BOOLEAN,
      documentation BOOLEAN,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS leave_request (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      leave_type TEXT,
      start_date TEXT,
      end_date TEXT,
      days INTEGER,
      reason TEXT,
      status TEXT,
      applied_date TEXT,
      approver TEXT,
      comments TEXT,
      rejection_reason TEXT,
      lop_days INTEGER DEFAULT 0,
      is_lop BOOLEAN DEFAULT FALSE,
      has_conflicts BOOLEAN DEFAULT FALSE,
      conflict_details TEXT,
      FOREIGN KEY(employee_id) REFERENCES employee(id),
      FOREIGN KEY(leave_type) REFERENCES leave_type(id)
    );

    CREATE TABLE IF NOT EXISTS holiday (
      date TEXT PRIMARY KEY,
      name TEXT,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS notification (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      type TEXT,
      priority TEXT
    );
  `);

  // Insert initial data if tables are empty
  await insertInitialData();
}

async function insertInitialData() {
  const db = dbConnection;
  
  // Check if data already exists
  const employeeCount = await db.get('SELECT COUNT(*) as count FROM employee');
  if (employeeCount.count > 0) {
    console.log('📊 Database already has data, skipping initialization');
    return;
  }

  console.log('🔄 Inserting initial data...');

  // Insert employees with hashed passwords
  const employees = [
    { id: 'TSG0091', name: 'Suraj', email: 'suraj@tensor.com', personalEmail: '22311a66d3@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Engineering', manager: 'TSG0092' },
    { id: 'TSG0092', name: 'Srinivas', email: 'srinivas@tensor.com', personalEmail: '22311a66e3@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Engineering', manager: 'TSG0019' },
    { id: 'TSG0093', name: 'Vinay', email: 'vinay@tensor.com', personalEmail: '22311a66d9@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Marketing', manager: 'TSG0094' },
    { id: 'TSG0094', name: 'Vishal', email: 'vishal@tensor.com', personalEmail: '22311a6690@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Marketing', manager: 'TSG0019' },
    { id: 'TSG0019', name: 'Teja', email: 'teja@tensor.com', personalEmail: 'vishalaryadacha@gmail.com', password: 'password123', role: 'admin', department: 'HR', manager: null }
  ];

  for (const emp of employees) {
    const hashedPassword = await bcrypt.hash(emp.password, 10);
    await db.run(
      'INSERT INTO employee (id, name, email, personal_email, password_hash, role, department, manager) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      emp.id, emp.name, emp.email, emp.personalEmail, hashedPassword, emp.role, emp.department, emp.manager
    );
  }

  // Insert leave types
  const leaveTypes = [
    { id: 'sick', name: 'Sick Leave', code: 'SL', color: '#ef4444', maxDays: 12, carryForward: false, documentation: true, description: 'For medical emergencies' },
    { id: 'casual', name: 'Casual Leave', code: 'CL', color: '#3b82f6', maxDays: 12, carryForward: true, documentation: false, description: 'Personal work/family' },
    { id: 'vacation', name: 'Vacation Leave', code: 'VL', color: '#10b981', maxDays: 18, carryForward: true, documentation: false, description: 'Planned holidays' },
    { id: 'academic', name: 'Academic Leave', code: 'AL', color: '#8b5cf6', maxDays: 5, carryForward: false, documentation: true, description: 'Education/skill' },
    { id: 'wfh', name: 'Work From Home', code: 'WFH', color: '#f59e0b', maxDays: 24, carryForward: false, documentation: false, description: 'Remote work' },
    { id: 'compoff', name: 'Comp Off', code: 'CO', color: '#06b6d4', maxDays: 12, carryForward: false, documentation: false, description: 'For overtime' }
  ];

  for (const lt of leaveTypes) {
    await db.run(
      'INSERT INTO leave_type (id, name, code, color, max_days, carry_forward, documentation, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      lt.id, lt.name, lt.code, lt.color, lt.maxDays, lt.carryForward, lt.documentation, lt.description
    );
  }

  // Insert leave balances for all employees
  const balances = [
    { employeeId: 'TSG0091', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },
    
    { employeeId: 'TSG0092', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },

    { employeeId: 'TSG0093', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },

    { employeeId: 'TSG0094', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0094', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0094', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0094', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0094', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0094', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },

    { employeeId: 'TSG0019', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0019', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0019', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0019', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0019', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0019', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 }
  ];

  for (const balance of balances) {
    await db.run(
      'INSERT INTO leave_balance (employee_id, leave_type, allocated, used, pending) VALUES (?, ?, ?, ?, ?)',
      balance.employeeId, balance.leaveType, balance.allocated, balance.used, balance.pending
    );
  }

  // Insert holidays
  const holidays = [
    { date: '2025-01-01', name: 'New Year Day', type: 'national' },
    { date: '2025-01-26', name: 'Republic Day', type: 'national' },
    { date: '2025-03-14', name: 'Holi', type: 'festival' },
    { date: '2025-04-14', name: 'Good Friday', type: 'festival' },
    { date: '2025-08-15', name: 'Independence Day', type: 'national' },
    { date: '2025-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2025-10-24', name: 'Dussehra', type: 'festival' },
    { date: '2025-11-12', name: 'Diwali', type: 'festival' },
    { date: '2025-12-25', name: 'Christmas', type: 'festival' }
  ];

  for (const holiday of holidays) {
    await db.run(
      'INSERT INTO holiday (date, name, type) VALUES (?, ?, ?)',
      holiday.date, holiday.name, holiday.type
    );
  }

  // Insert initial notifications
  const notifications = [
    { message: "🎉 TensorGo Wins the Oracle Excellence GenAI Application Innovation Award!", type: "achievement", priority: "high" },
    { message: "🔄 HRMS System initialized successfully", type: "info", priority: "medium" },
    { message: "📊 All leave balances have been set up", type: "update", priority: "low" }
  ];

  for (const notif of notifications) {
    await db.run(
      'INSERT INTO notification (message, type, priority) VALUES (?, ?, ?)',
      notif.message, notif.type, notif.priority
    );
  }

  console.log('✅ Initial data inserted successfully');
}

module.exports = getDb;
