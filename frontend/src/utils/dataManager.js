// Enhanced Data Manager with API integration and LOP functionality
import apiClient from './apiClient';

// Fallback to localStorage for development/offline mode
const LS_KEY = 'hrms_data';
const USE_API = true; // Set to true when backend is working

const getInitialData = () => ({
  employees: [
    { id: 'TSG0091', name: 'Suraj', email: 'suraj@tensor.com', personalEmail: '22311a66d3@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Engineering', manager: 'TSG0092' },
    { id: 'TSG0092', name: 'Srinivas', email: 'srinivas@tensor.com', personalEmail: '22311a66e3@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Engineering', manager: 'TSG0019' },
    { id: 'TSG0093', name: 'Vinay', email: 'vinay@tensor.com', personalEmail: '22311a66d9@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Marketing', manager: 'TSG0094' },
    { id: 'TSG0094', name: 'Vishal', email: 'vishal@tensor.com', personalEmail: '22311a6690@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Marketing', manager: 'TSG0019' },
    { id: 'TSG0019', name: 'Teja', email: 'teja@tensor.com', personalEmail: 'vishalaryadacha@gmail.com', password: 'password123', role: 'admin', department: 'HR', manager: null }
  ],
  leaveTypes: [
    { id: 'sick', name: 'Sick Leave', code: 'SL', color: '#ef4444', maxDays: 12, carryForward: false, documentation: true, description: 'For medical emergencies' },
    { id: 'casual', name: 'Casual Leave', code: 'CL', color: '#3b82f6', maxDays: 12, carryForward: true, documentation: false, description: 'Personal work/family' },
    { id: 'vacation', name: 'Vacation Leave', code: 'VL', color: '#10b981', maxDays: 18, carryForward: true, documentation: false, description: 'Planned holidays' },
    { id: 'academic', name: 'Academic Leave', code: 'AL', color: '#8b5cf6', maxDays: 5, carryForward: false, documentation: true, description: 'Education/skill' },
    { id: 'wfh', name: 'Work From Home', code: 'WFH', color: '#f59e0b', maxDays: 24, carryForward: false, documentation: false, description: 'Remote work' },
    { id: 'compoff', name: 'Comp Off', code: 'CO', color: '#06b6d4', maxDays: 12, carryForward: false, documentation: false, description: 'For overtime' }
  ],
  holidays: [
    { date: '2025-01-01', name: 'New Year Day', type: 'national' },
    { date: '2025-01-26', name: 'Republic Day', type: 'national' },
    { date: '2025-03-14', name: 'Holi', type: 'festival' },
    { date: '2025-04-14', name: 'Good Friday', type: 'festival' },
    { date: '2025-08-15', name: 'Independence Day', type: 'national' },
    { date: '2025-10-02', name: 'Gandhi Jayanti', type: 'national' },
    { date: '2025-10-24', name: 'Dussehra', type: 'festival' },
    { date: '2025-11-12', name: 'Diwali', type: 'festival' },
    { date: '2025-12-25', name: 'Christmas', type: 'festival' }
  ],
  leaveBalances: [
    // Suraj (Employee)
    { employeeId: 'TSG0091', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0091', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },

    // Srinivas (Manager)
    { employeeId: 'TSG0092', leaveType: 'sick', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'casual', allocated: 12, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'vacation', allocated: 18, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'academic', allocated: 5, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'wfh', allocated: 24, used: 0, pending: 0 },
    { employeeId: 'TSG0092', leaveType: 'compoff', allocated: 12, used: 0, pending: 0 },

    // Other employees...
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
  ],
  leaveRequests: [],
  notifications: [
    { id: 1, message: "🎉 TensorGo Wins the Oracle Excellence GenAI Application Innovation Award!", type: "achievement", priority: "high" },
    { id: 2, message: "🔄 Backend API integration completed", type: "info", priority: "medium" }
  ]
});

function _loadRawData() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const initialData = getInitialData();
    localStorage.setItem(LS_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(raw);
}

function _saveRawData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export const dataManager = {
  // Employee operations
  async getEmployees() {
    if (USE_API) {
      try {
        return await apiClient.getEmployees();
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return _loadRawData().employees;
      }
    }
    return _loadRawData().employees;
  },

  async getEmployeeById(id) {
    if (USE_API) {
      try {
        return await apiClient.getEmployeeById(id);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return _loadRawData().employees.find(e => e.id === id);
      }
    }
    return _loadRawData().employees.find(e => e.id === id);
  },

  async getEmployeeByEmail(email) {
    if (USE_API) {
      try {
        const employees = await apiClient.getEmployees();
        return employees.find(e => e.email === email || e.personal_email === email);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return _loadRawData().employees.find(e => e.email === email);
      }
    }
    return _loadRawData().employees.find(e => e.email === email);
  },

  // Leave types
  async getLeaveTypes() {
    if (USE_API) {
      try {
        return await apiClient.getLeaveTypes();
      } catch (error) {
        console.warn('API failed, using fallback leave types:', error);
      }
    }
    return _loadRawData().leaveTypes;
  },

  // Holidays
  async getHolidays() {
    if (USE_API) {
      try {
        return await apiClient.getHolidays();
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return _loadRawData().holidays;
      }
    }
    return _loadRawData().holidays;
  },

  // Leave balances
  async getLeaveBalances(employeeId) {
    const data = _loadRawData();
    return data.leaveBalances.filter(lb => lb.employeeId === employeeId);
  },

  async updateLeaveBalance(employeeId, leaveType, delta) {
    const data = _loadRawData();
    const idx = data.leaveBalances.findIndex(l => l.employeeId === employeeId && l.leaveType === leaveType);
    if (idx >= 0) {
      data.leaveBalances[idx].used += delta;
      _saveRawData(data);
      return data.leaveBalances[idx];
    }
    return null;
  },

  // *** MISSING METHODS - ADD THESE ***

  // LOP (Loss of Pay) calculation and validation
  async calculateLOPDays(employeeId, leaveType, requestedDays) {
    console.log('💰 Calculating LOP for employee:', employeeId);

    const balances = await this.getLeaveBalances(employeeId);
    const balance = balances.find(b => b.leaveType === leaveType);

    if (!balance) {
      console.warn('⚠️ No balance found for leave type:', leaveType);
      return { lopDays: requestedDays, availableDays: 0 };
    }

    const availableDays = balance.allocated - balance.used - balance.pending;
    const lopDays = Math.max(0, requestedDays - availableDays);

    console.log('💰 LOP Calculation:', {
      allocated: balance.allocated,
      used: balance.used,
      pending: balance.pending,
      available: availableDays,
      requested: requestedDays,
      lopDays: lopDays
    });

    return { lopDays, availableDays };
  },

  // Check annual LOP limit
  async checkAnnualLOPLimit(employeeId, additionalLOPDays = 0) {
    console.log('📊 Checking annual LOP limit for employee:', employeeId);

    const MAX_LOP_DAYS_PER_YEAR = 10; // Configurable limit
    const currentYear = new Date().getFullYear();

    const allRequests = await this.getLeaveRequests(employeeId);

    // Calculate total LOP days used this year
    let totalLOPUsed = 0;
    for (const request of allRequests) {
      if (request.status === 'approved' && new Date(request.startDate).getFullYear() === currentYear) {
        const lopInfo = await this.calculateLOPDays(employeeId, request.leaveType, request.days);
        totalLOPUsed += lopInfo.lopDays;
      }
    }

    const totalLOPAfterRequest = totalLOPUsed + additionalLOPDays;
    const remainingLOPDays = MAX_LOP_DAYS_PER_YEAR - totalLOPUsed;

    console.log('📊 LOP Limit Check:', {
      maxLOPPerYear: MAX_LOP_DAYS_PER_YEAR,
      totalLOPUsed,
      additionalLOPDays,
      totalLOPAfterRequest,
      remainingLOPDays,
      withinLimit: totalLOPAfterRequest <= MAX_LOP_DAYS_PER_YEAR
    });

    return {
      withinLimit: totalLOPAfterRequest <= MAX_LOP_DAYS_PER_YEAR,
      totalLOPUsed,
      remainingLOPDays,
      maxLOPPerYear: MAX_LOP_DAYS_PER_YEAR,
      wouldExceedBy: Math.max(0, totalLOPAfterRequest - MAX_LOP_DAYS_PER_YEAR)
    };
  },

  // Check for leave conflicts
  async checkLeaveConflicts(employeeId, startDate, endDate, excludeRequestId = null) {
    console.log('🔍 Checking for leave conflicts...');
    console.log('Employee ID:', employeeId);
    console.log('Date range:', startDate, 'to', endDate);

    const { leaveRequests } = _loadRawData();

    // Get all approved and pending leaves for the employee
    const employeeLeaves = leaveRequests.filter(req =>
      req.employeeId === employeeId &&
      (req.status === 'approved' || req.status === 'pending') &&
      req.id !== excludeRequestId // Exclude current request if editing
    );

    console.log('📊 Found employee leaves:', employeeLeaves.length);

    const conflicts = [];
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    for (const leave of employeeLeaves) {
      const existingStart = new Date(leave.startDate);
      const existingEnd = new Date(leave.endDate);

      // Check for overlap
      const hasOverlap = (newStart <= existingEnd) && (newEnd >= existingStart);

      if (hasOverlap) {
        console.log('⚠️ Conflict detected with leave:', leave.id);
        conflicts.push({
          conflictingLeave: leave,
          overlapType: this.getOverlapType(newStart, newEnd, existingStart, existingEnd)
        });
      }
    }

    console.log('🔍 Total conflicts found:', conflicts.length);
    return conflicts;
  },

  // Determine the type of overlap
  getOverlapType(newStart, newEnd, existingStart, existingEnd) {
    if (newStart >= existingStart && newEnd <= existingEnd) {
      return 'completely_within';
    } else if (newStart <= existingStart && newEnd >= existingEnd) {
      return 'completely_covers';
    } else if (newStart < existingStart && newEnd >= existingStart && newEnd <= existingEnd) {
      return 'overlaps_start';
    } else if (newStart >= existingStart && newStart <= existingEnd && newEnd > existingEnd) {
      return 'overlaps_end';
    } else {
      return 'partial_overlap';
    }
  },

  // Get leave timeline for an employee
  async getEmployeeLeaveTimeline(employeeId, startDate = null, endDate = null) {
    const { leaveRequests } = _loadRawData();
    const leaveTypes = await this.getLeaveTypes();

    let timeline = leaveRequests.filter(req =>
      req.employeeId === employeeId &&
      (req.status === 'approved' || req.status === 'pending')
    );

    // Filter by date range if provided
    if (startDate && endDate) {
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);

      timeline = timeline.filter(req => {
        const reqStart = new Date(req.startDate);
        const reqEnd = new Date(req.endDate);

        // Include if there's any overlap with the filter range
        return (reqStart <= filterEnd) && (reqEnd >= filterStart);
      });
    }

    // Add leave type information
    timeline = timeline.map(req => ({
      ...req,
      leaveTypeInfo: leaveTypes.find(lt => lt.id === req.leaveType)
    }));

    // Sort by start date
    timeline.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return timeline;
  },

  // Leave requests
  async getLeaveRequests(employeeId = null) {
    if (USE_API) {
      try {
        if (employeeId) {
          return await apiClient.getMyLeaves();
        } else {
          return await apiClient.getPendingApprovals();
        }
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        const data = _loadRawData();
        return employeeId ? data.leaveRequests.filter(req => req.employeeId === employeeId) : data.leaveRequests;
      }
    }
    const data = _loadRawData();
    return employeeId ? data.leaveRequests.filter(req => req.employeeId === employeeId) : data.leaveRequests;
  },

  async getPendingRequestsForApprover(approverId) {
    if (USE_API) {
      try {
        return await apiClient.getPendingApprovals();
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return _loadRawData().leaveRequests.filter(req => req.approver === approverId && req.status === 'pending');
      }
    }
    return _loadRawData().leaveRequests.filter(req => req.approver === approverId && req.status === 'pending');
  },

  // Enhanced leave request creation with LOP handling
  async addLeaveRequestWithLOP(request) {
    console.log('📝 Adding leave request with LOP calculation:', request);

    // Calculate LOP for this request
    const lopInfo = await this.calculateLOPDays(request.employeeId, request.leaveType, request.days);

    // Check if LOP exceeds annual limit
    const lopLimitCheck = await this.checkAnnualLOPLimit(request.employeeId, lopInfo.lopDays);

    if (!lopLimitCheck.withinLimit) {
      throw new Error(`Request would exceed annual LOP limit. You would exceed by ${lopLimitCheck.wouldExceedBy} days. Remaining LOP allowance: ${lopLimitCheck.remainingLOPDays} days.`);
    }

    // Get approver
    const approver = await this.getApproverForEmployee(request.employeeId);
    if (!approver) {
      throw new Error('No approver found for this employee');
    }

    const data = _loadRawData();
    const newId = 'LR' + String(data.leaveRequests.length + 1).padStart(3, '0');

    const reqObj = {
      ...request,
      id: newId,
      status: 'pending',
      appliedDate: new Date().toISOString().slice(0, 10),
      approver: approver.id,
      comments: '',
      rejectionReason: '',
      lopDays: lopInfo.lopDays,
      availableDays: lopInfo.availableDays,
      isLOP: lopInfo.lopDays > 0
    };

    console.log('✅ Leave request created with LOP info:', reqObj);

    data.leaveRequests.push(reqObj);
    _saveRawData(data);
    return reqObj;
  },

  async updateLeaveRequestStatus(id, status, comments = '', rejectionReason = '') {
    if (USE_API) {
      try {
        if (status === 'approved') {
          return await apiClient.approveLeave(id, comments);
        } else if (status === 'rejected') {
          return await apiClient.rejectLeave(id, rejectionReason, comments);
        }
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const data = _loadRawData();
    const req = data.leaveRequests.find(r => r.id === id);
    if (!req) return null;
    req.status = status;
    req.comments = comments || '';
    req.rejectionReason = rejectionReason || '';
    _saveRawData(data);
    return req;
  },

  // Cancel leave request (only before start date)
  async cancelLeaveRequest(requestId, userId) {
    console.log('❌ Attempting to cancel leave request:', requestId);

    const data = _loadRawData();
    const request = data.leaveRequests.find(r => r.id === requestId);

    if (!request) {
      throw new Error('Leave request not found');
    }

    if (request.employeeId !== userId) {
      throw new Error('You can only cancel your own leave requests');
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending leave requests can be cancelled');
    }

    const startDate = new Date(request.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

    if (startDate <= today) {
      throw new Error('Cannot cancel leave request on or after the start date');
    }

    // Update request status
    request.status = 'cancelled';
    request.comments = `Cancelled by employee on ${new Date().toISOString().slice(0, 10)}`;

    // If the request had pending days, we need to adjust the balance
    if (request.lopDays === 0) {
      // Find and update leave balance pending count
      const balanceIndex = data.leaveBalances.findIndex(b =>
        b.employeeId === request.employeeId && b.leaveType === request.leaveType
      );
      if (balanceIndex >= 0) {
        data.leaveBalances[balanceIndex].pending = Math.max(0, data.leaveBalances[balanceIndex].pending - request.days);
      }
    }

    _saveRawData(data);
    console.log('✅ Leave request cancelled successfully');
    return request;
  },

  // Get LOP analytics for employee
  async getLOPAnalytics(employeeId) {
    if (USE_API) {
      try {
        return await apiClient.getLOPAnalytics();
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }

    // Fallback localStorage analytics - FIXED FOR ADMIN
    const currentYear = new Date().getFullYear();
    const allRequests = await this.getLeaveRequests(employeeId);

    // Filter only approved requests with actual LOP days
    const approvedRequests = allRequests.filter(r =>
      r.status === 'approved' &&
      r.lopDays > 0 && // Only requests that actually have LOP
      new Date(r.startDate).getFullYear() === currentYear
    );

    console.log(`📊 LOP Analysis for ${employeeId}:`, {
      totalRequests: allRequests.length,
      approvedWithLOP: approvedRequests.length,
      requests: approvedRequests
    });

    let totalLOPDays = 0;
    const lopBreakdown = {};

    for (const request of approvedRequests) {
      if (request.lopDays && request.lopDays > 0) {
        totalLOPDays += request.lopDays;
        if (!lopBreakdown[request.leaveType]) {
          lopBreakdown[request.leaveType] = 0;
        }
        lopBreakdown[request.leaveType] += request.lopDays;
      }
    }

    return {
      totalLOPDays,
      lopBreakdown,
      remainingLOPDays: Math.max(0, 10 - totalLOPDays),
      maxLOPPerYear: 10,
      lopUtilizationPercent: Math.round((totalLOPDays / 10) * 100)
    };
  },


  // Get approver for employee (simplified for API integration)
  async getApproverForEmployee(employeeId) {
    const employees = await this.getEmployees();
    const employee = employees.find(e => e.id === employeeId);

    if (!employee) return null;

    let approver = null;
    if (employee.role === 'employee') {
      approver = employee.manager ? employees.find(e => e.id === employee.manager) : null;
    } else if (employee.role === 'manager') {
      approver = employees.find(e => e.role === 'admin');
    }

    return approver;
  },

  // Other existing methods
  async getNotifications() {
    return _loadRawData().notifications;
  },

  async addNotification(notification) {
    const data = _loadRawData();
    const newNotification = {
      ...notification,
      id: (data.notifications.length > 0 ? data.notifications[data.notifications.length - 1].id + 1 : 1)
    };
    data.notifications.push(newNotification);
    _saveRawData(data);
    return newNotification;
  },

  // Employee Management
  async addEmployee(employeeData) {
    const data = _loadRawData();

    // Check if employee ID already exists
    if (data.employees.find(e => e.id === employeeData.id)) {
      throw new Error('Employee ID already exists');
    }

    // Check if email already exists
    if (data.employees.find(e => e.email === employeeData.email)) {
      throw new Error('Email already exists');
    }

    const newEmployee = {
      ...employeeData,
      password: 'password123'
    };

    data.employees.push(newEmployee);

    // Create leave balances for new employee
    const leaveTypes = await this.getLeaveTypes();
    for (const leaveType of leaveTypes) {
      data.leaveBalances.push({
        employeeId: employeeData.id,
        leaveType: leaveType.id,
        allocated: leaveType.maxDays,
        used: 0,
        pending: 0
      });
    }

    _saveRawData(data);
    return newEmployee;
  },

  async updateEmployee(employeeId, employeeData) {
    const data = _loadRawData();
    const index = data.employees.findIndex(e => e.id === employeeId);

    if (index === -1) {
      throw new Error('Employee not found');
    }

    // Don't allow changing the employee ID
    const updatedEmployee = { ...data.employees[index], ...employeeData, id: employeeId };
    data.employees[index] = updatedEmployee;

    _saveRawData(data);
    return updatedEmployee;
  },

  async deleteEmployee(employeeId) {
    const data = _loadRawData();

    if (employeeId === 'TSG0019') { 
      throw new Error('Cannot delete admin user');
    }

    // Remove employee
    data.employees = data.employees.filter(e => e.id !== employeeId);

    // Remove leave balances
    data.leaveBalances = data.leaveBalances.filter(b => b.employeeId !== employeeId);

    // Update manager references
    data.employees.forEach(emp => {
      if (emp.manager === employeeId) {
        emp.manager = 'TSG0019';
      }
    });

    _saveRawData(data);
    return true;
  },

  // Holiday Management
  async addHoliday(holidayData) {
    const data = _loadRawData();

    // Check if holiday already exists for this date
    if (data.holidays.find(h => h.date === holidayData.date)) {
      throw new Error('Holiday already exists for this date');
    }

    data.holidays.push(holidayData);
    data.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    _saveRawData(data);
    return holidayData;
  },

  async deleteHoliday(holidayDate) {
    const data = _loadRawData();
    data.holidays = data.holidays.filter(h => h.date !== holidayDate);
    _saveRawData(data);
    return true;
  },

  // Leave Quota Management
  async updateLeaveQuota(quotaData) {
    const data = _loadRawData();
    const { employeeId, leaveType, allocated, used, pending } = quotaData;

    const index = data.leaveBalances.findIndex(
      b => b.employeeId === employeeId && b.leaveType === leaveType
    );

    if (index === -1) {
      // Create new balance entry
      data.leaveBalances.push({
        employeeId,
        leaveType,
        allocated: parseInt(allocated),
        used: parseInt(used),
        pending: parseInt(pending)
      });
    } else {
      // Update existing balance
      data.leaveBalances[index] = {
        ...data.leaveBalances[index],
        allocated: parseInt(allocated),
        used: parseInt(used),
        pending: parseInt(pending)
      };
    }

    _saveRawData(data);
    return data.leaveBalances[index];
  },

  // Get all leave balances for quota management
  async getAllLeaveBalances() {
    const data = _loadRawData();
    return data.leaveBalances;
  },

  // Analytics for admin
  async getAdminAnalytics() {
    const data = _loadRawData();
    const currentYear = new Date().getFullYear();

    return {
      totalEmployees: data.employees.length,
      employeesByRole: {
        admin: data.employees.filter(e => e.role === 'admin').length,
        manager: data.employees.filter(e => e.role === 'manager').length,
        employee: data.employees.filter(e => e.role === 'employee').length
      },
      employeesByDepartment: data.employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {}),
      totalLeaveRequests: data.leaveRequests.length,
      pendingRequests: data.leaveRequests.filter(r => r.status === 'pending').length,
      approvedRequests: data.leaveRequests.filter(r => r.status === 'approved').length,
      rejectedRequests: data.leaveRequests.filter(r => r.status === 'rejected').length,
      totalHolidays: data.holidays.length,
      holidaysByType: data.holidays.reduce((acc, holiday) => {
        acc[holiday.type] = (acc[holiday.type] || 0) + 1;
        return acc;
      }, {})
    };
  },

  async addEmployee(employeeData) {
    if (USE_API) {
      try {
        return await apiClient.addEmployee(employeeData);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage (existing code)
    const data = _loadRawData();
    // ... existing localStorage logic
  },
  
  async updateEmployee(employeeId, employeeData) {
    if (USE_API) {
      try {
        return await apiClient.updateEmployee(employeeId, employeeData);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
  },
  
  async deleteEmployee(employeeId) {
    if (USE_API) {
      try {
        return await apiClient.deleteEmployee(employeeId);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
  },
  
  // Admin Holiday Management
  async addHoliday(holidayData) {
    if (USE_API) {
      try {
        return await apiClient.addHoliday(holidayData);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
  },
  
  async deleteHoliday(holidayDate) {
    if (USE_API) {
      try {
        return await apiClient.deleteHoliday(holidayDate);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
  },
  
  // Admin Leave Quota Management
  async updateLeaveQuota(quotaData) {
    if (USE_API) {
      try {
        return await apiClient.updateLeaveQuota(quotaData);
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
      }
    }
  }
};
