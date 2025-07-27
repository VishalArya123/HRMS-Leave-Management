// Enhanced Mock Data with more leave requests for testing

export const employees = [
    {
      id: 'TSG0091',
      name: 'Suraj',
      email: 'suraj@tensor.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      manager: 'TSG0019',
    },
    {
      id: 'TSG0092',
      name: 'Srinivas',
      email: 'srinivas@tensor.com',
      password: 'password123',
      role: 'manager',
      department: 'Engineering',
      manager: null
    },
    {
      id: 'TSG0093',
      name: 'Vinay',
      email: 'vinay@tensor.com',
      password: 'password123',
      role: 'employee',
      department: 'Marketing',
      manager: 'TSG0094'
    },
    {
      id: 'TSG0094',
      name: 'Vishal',
      email: 'vishal@tensor.com',
      password: 'password123',
      role: 'manager',
      department: 'Marketing',
      manager: null
    },
    {
      id: 'TSG0019',
      name: 'Teja',
      email: 'teja@tensor.com',
      password: 'password123',
      role: 'admin',
      department: 'HR',
      manager: null
    }
  ];
  
  export const leaveTypes = [
    {
      id: 'sick',
      name: 'Sick Leave',
      code: 'SL',
      color: '#ef4444',
      maxDays: 12,
      carryForward: false,
      documentation: true,
      description: 'For medical emergencies and health-related issues'
    },
    {
      id: 'casual',
      name: 'Casual Leave',
      code: 'CL',
      color: '#3b82f6',
      maxDays: 12,
      carryForward: true,
      documentation: false,
      description: 'For personal work and family occasions'
    },
    {
      id: 'vacation',
      name: 'Vacation Leave',
      code: 'VL',
      color: '#10b981',
      maxDays: 18,
      carryForward: true,
      documentation: false,
      description: 'For planned holidays and recreational activities'
    },
    {
      id: 'academic',
      name: 'Academic Leave',
      code: 'AL',
      color: '#8b5cf6',
      maxDays: 5,
      carryForward: false,
      documentation: true,
      description: 'For educational purposes and skill development'
    },
    {
      id: 'wfh',
      name: 'Work From Home',
      code: 'WFH',
      color: '#f59e0b',
      maxDays: 24,
      carryForward: false,
      documentation: false,
      description: 'For remote work flexibility'
    },
    {
      id: 'compoff',
      name: 'Comp Off',
      code: 'CO',
      color: '#06b6d4',
      maxDays: 12,
      carryForward: false,
      documentation: false,
      description: 'Compensatory leave for overtime work'
    }
  ];
  
  export const holidays = [
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
  
  export const leaveBalances = [
    { employeeId: 'TSG0091', leaveType: 'sick', allocated: 12, used: 3, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'casual', allocated: 12, used: 5, pending: 1 },
    { employeeId: 'TSG0091', leaveType: 'vacation', allocated: 18, used: 8, pending: 2 },
    { employeeId: 'TSG0091', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'wfh', allocated: 24, used: 12, pending: 1 },
    { employeeId: 'TSG0091', leaveType: 'compoff', allocated: 12, used: 2, pending: 0 },
    
    { employeeId: 'TSG0092', leaveType: 'sick', allocated: 12, used: 1, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'casual', allocated: 12, used: 3, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'vacation', allocated: 18, used: 6, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'academic', allocated: 5, used: 2, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'wfh', allocated: 24, used: 8, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'compoff', allocated: 12, used: 4, pending: 0 },
  
    { employeeId: 'TSG0093', leaveType: 'sick', allocated: 12, used: 2, pending: 1 },
    { employeeId: 'TSG0093', leaveType: 'casual', allocated: 12, used: 4, pending: 0 },
    { employeeId: 'TSG0093', leaveType: 'vacation', allocated: 18, used: 5, pending: 0 }
  ];
  
  // Enhanced leave requests with more test data
  export let leaveRequests = [
    {
      id: 'LR001',
      employeeId: 'TSG0091',
      leaveType: 'casual',
      startDate: '2025-08-01',
      endDate: '2025-08-01',
      days: 1,
      reason: 'Personal work - bank visit and documentation',
      status: 'pending',
      appliedDate: '2025-07-25',
      approver: 'TSG0019',
      comments: '',
      rejectionReason: ''
    },
    {
      id: 'LR002',
      employeeId: 'TSG0091',
      leaveType: 'vacation',
      startDate: '2025-08-15',
      endDate: '2025-08-16',
      days: 2,
      reason: 'Family vacation to Goa for Independence Day weekend',
      status: 'pending',
      appliedDate: '2025-07-20',
      approver: 'TSG0019',
      comments: '',
      rejectionReason: ''
    },
    {
      id: 'LR003',
      employeeId: 'TSG0093',
      leaveType: 'sick',
      startDate: '2025-07-28',
      endDate: '2025-07-29',
      days: 2,
      reason: 'Medical consultation and follow-up treatment',
      status: 'pending',
      appliedDate: '2025-07-26',
      approver: 'TSG0094',
      comments: '',
      rejectionReason: ''
    },
    {
      id: 'LR004',
      employeeId: 'TSG0091',
      leaveType: 'wfh',
      startDate: '2025-07-30',
      endDate: '2025-07-31',
      days: 2,
      reason: 'Home renovation work - contractor visit required',
      status: 'approved',
      appliedDate: '2025-07-20',
      approver: 'TSG0019',
      comments: 'Approved for WFH during renovation',
      rejectionReason: ''
    }
  ];
  
  export const notifications = [
    {
      id: 1,
      message: "🎉 TensorGo Wins the Oracle Excellence GenAI Application Innovation Award!",
      type: "achievement",
      priority: "high"
    },
    {
      id: 2,
      message: "📅 Holiday Calendar updated for Q3 2025",
      type: "info",
      priority: "medium"
    },
    {
      id: 3,
      message: "🔄 Leave balance updated for July 2025",
      type: "update",
      priority: "low"
    }
  ];
  
  export const workflowSteps = [
    { id: 1, name: 'Apply', description: 'Employee submits leave request' },
    { id: 2, name: 'Review', description: 'Manager/HR reviews the request' },
    { id: 3, name: 'Approve/Reject', description: 'Final decision on leave request' },
    { id: 4, name: 'Notification', description: 'Email notification sent to all parties' }
  ];
  
  // Helper functions for dynamic data manipulation
  export const updateLeaveRequestStatus = (id, status, comments = '', rejectionReason = '') => {
    const requestIndex = leaveRequests.findIndex(req => req.id === id);
    if (requestIndex !== -1) {
      leaveRequests[requestIndex].status = status;
      leaveRequests[requestIndex].comments = comments;
      leaveRequests[requestIndex].rejectionReason = rejectionReason;
      return true;
    }
    return false;
  };
  
  export const addLeaveRequest = (request) => {
    const newId = `LR${String(leaveRequests.length + 1).padStart(3, '0')}`;
    const newRequest = {
      ...request,
      id: newId,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      comments: '',
      rejectionReason: ''
    };
    leaveRequests.push(newRequest);
    return newRequest;
  };
  