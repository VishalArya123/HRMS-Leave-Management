-- Employees (manager can be NULL for admin)
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

-- Leave allocation and usage
CREATE TABLE IF NOT EXISTS leave_balance (
  employee_id TEXT,
  leave_type TEXT,
  allocated INTEGER,
  used INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  PRIMARY KEY (employee_id, leave_type)
);

-- Leave types
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

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_request (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  FOREIGN KEY(employee_id) REFERENCES employee(id),
  FOREIGN KEY(leave_type) REFERENCES leave_type(id)
);

-- Holidays
CREATE TABLE IF NOT EXISTS holiday (
  date TEXT PRIMARY KEY,
  name TEXT,
  type TEXT
);
