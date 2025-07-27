// Application constants

export const LEAVE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  };
  
  export const USER_ROLES = {
    EMPLOYEE: 'employee',
    MANAGER: 'manager',
    ADMIN: 'admin'
  };
  
  export const LEAVE_TYPES_CONFIG = {
    SICK: { id: 'sick', name: 'Sick Leave', requiresDoc: true },
    CASUAL: { id: 'casual', name: 'Casual Leave', requiresDoc: false },
    VACATION: { id: 'vacation', name: 'Vacation Leave', requiresDoc: false },
    ACADEMIC: { id: 'academic', name: 'Academic Leave', requiresDoc: true },
    WFH: { id: 'wfh', name: 'Work From Home', requiresDoc: false },
    COMPOFF: { id: 'compoff', name: 'Comp Off', requiresDoc: false }
  };
  
  export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  };
  
  export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    API: 'yyyy-MM-dd'
  };
  
  export const API_ENDPOINTS = {
    // Future backend endpoints
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    LEAVES: '/api/leaves',
    BALANCES: '/api/leaves/balances',
    APPROVALS: '/api/leaves/approvals',
    HOLIDAYS: '/api/holidays',
    EMPLOYEES: '/api/employees'
  };
  
  export const VALIDATION_RULES = {
    LEAVE_REASON_MIN_LENGTH: 10,
    LEAVE_REASON_MAX_LENGTH: 200,
    MAX_LEAVE_DAYS: 30,
    MIN_ADVANCE_DAYS: 1
  };
  
  export const THEME_COLORS = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };
  