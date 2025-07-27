import React, { useState } from 'react';
import { dataManager } from '../utils/dataManager';
import { validateLeaveRequestWithLOP, formatConflictMessage } from '../utils/validation';
import { sendEmail, emailTemplates } from '../utils/emailService';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, ArrowRight, AlertCircle, AlertTriangle, Clock, XCircle, DollarSign, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ApplyLeave = () => {
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState({ errors: [], warnings: [], lopInfo: null });
  const [conflicts, setConflicts] = useState([]);
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [approver, setApprover] = useState(null);

  React.useEffect(() => {
    loadInitialData();
  }, []);

  React.useEffect(() => {
    if (leaveType && startDate && endDate) {
      validateDates();
    }
  }, [startDate, endDate, leaveType]);

  const loadInitialData = async () => {
    try {
      const [typesData, holidaysData] = await Promise.all([
        dataManager.getLeaveTypes(),
        dataManager.getHolidays()
      ]);
      setLeaveTypes(typesData);
      setHolidays(holidaysData);
      if (typesData.length > 0) {
        setLeaveType(typesData[0].id);
      }
      
      loadEmployeeTimeline();
      loadApprover();
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load initial data error:', error);
    }
  };

  const loadApprover = async () => {
    try {
      const approverData = await dataManager.getApproverForEmployee(user.id);
      setApprover(approverData);
    } catch (error) {
      console.error('Failed to load approver:', error);
    }
  };

  const loadEmployeeTimeline = async () => {
    try {
      const timelineData = await dataManager.getEmployeeLeaveTimeline(user.id);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  };

  const validateDates = async () => {
    if (!startDate || !endDate || !leaveType) return;
    
    setValidating(true);
    
    try {
      const days = calculateDays();
      const validation = await validateLeaveRequestWithLOP(
        user.id,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
        leaveType,
        reason,
        days
      );
      
      const filteredErrors = validation.errors.filter(error => 
        error !== 'Reason must be at least 10 characters long'
      );
      
      setValidationResult({ 
        ...validation, 
        errors: filteredErrors 
      });
      
      const conflictData = await dataManager.checkLeaveConflicts(
        user.id,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10)
      );
      
      setConflicts(conflictData);
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({ 
        errors: ['Failed to validate leave request'], 
        warnings: [],
        lopInfo: null
      });
    } finally {
      setValidating(false);
    }
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await dataManager.cancelLeaveRequest(requestId, user.id);
      toast.success('Leave request cancelled successfully');
      loadEmployeeTimeline();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const canCancelRequest = (request) => {
    if (request.status !== 'pending') return false;
    
    const startDate = new Date(request.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return startDate > today;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (validationResult.errors.length > 0) {
      toast.error('Please resolve all errors before submitting');
      return;
    }

    // Show LOP confirmation if applicable
    if (validationResult.lopInfo?.isLOP) {
      const confirmLOP = window.confirm(
        `⚠️ LOP Warning:\n\nThis request will result in ${validationResult.lopInfo.lopDays} Loss of Pay (LOP) day(s).\n\n` +
        `You only have ${validationResult.lopInfo.availableDays} available days for ${leaveTypes.find(lt => lt.id === leaveType)?.name}.\n\n` +
        `LOP days will be deducted from your salary.\n\nDo you want to proceed?`
      );
      
      if (!confirmLOP) {
        return;
      }
    }

    // Show conflict confirmation if applicable
    if (conflicts.length > 0) {
      const confirmSubmit = window.confirm(
        `Warning: This leave request conflicts with existing leaves.\n\n${formatConflictMessage(conflicts)}\n\nDo you still want to submit this request?`
      );
      
      if (!confirmSubmit) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const days = calculateDays();
      const selectedLeaveType = leaveTypes.find(lt => lt.id === leaveType);
      const currentApprover = await dataManager.getApproverForEmployee(user.id);

      if (!currentApprover) {
        toast.error('No approver found for your role. Please contact HR.');
        setSubmitting(false);
        return;
      }

      const leaveRequest = {
        employeeId: user.id,
        leaveType,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        days,
        reason,
        hasConflicts: conflicts.length > 0,
        conflictDetails: conflicts.length > 0 ? formatConflictMessage(conflicts) : ''
      };

      // Use the enhanced method with LOP handling
      const newRequest = await dataManager.addLeaveRequestWithLOP(leaveRequest);

      // Prepare email data
      const emailData = {
        managerName: currentApprover.name,
        managerEmail: currentApprover.personalEmail || currentApprover.email,
        employeeName: user.name,
        leaveType: selectedLeaveType?.name || leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        days: days,
        reason: reason,
        conflictWarning: conflicts.length > 0 ? formatConflictMessage(conflicts) : '',
        lopWarning: newRequest.isLOP ? `⚠️ LOP Alert: ${newRequest.lopDays} day(s) will be Loss of Pay` : '',
        approverRole: currentApprover.role
      };

      const emailParams = emailTemplates.leaveApplication(emailData);
      const emailResult = await sendEmail(emailParams);

      if (emailResult.success) {
        toast.success(`Leave application submitted and notification sent to ${currentApprover.role}!`);
        if (newRequest.isLOP) {
          toast.warning(`Note: ${newRequest.lopDays} day(s) will be Loss of Pay (LOP)`);
        }
      } else {
        toast.success('Leave application submitted!');
        toast.warning('Email notification failed to send');
      }

      // Reset form
      setReason('');
      setStartDate(new Date());
      setEndDate(new Date());
      setValidationResult({ errors: [], warnings: [], lopInfo: null });
      setConflicts([]);
      
      loadEmployeeTimeline();

    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
      console.error('❌ Apply leave error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Approval Hierarchy Info */}
      {approver && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="font-semibold text-blue-800 mb-2">📋 Approval Hierarchy</h4>
          <p className="text-blue-700 text-sm">
            Your leave requests will be sent to <strong>{approver.name}</strong> ({approver.role}) for approval.
          </p>
        </motion.div>
      )}

      {/* Main Application Form */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          Apply for Leave
        </h2>
        
        <form onSubmit={handleApply} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Leave Type</label>
            <select
              className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              value={leaveType}
              onChange={e => setLeaveType(e.target.value)}
              required
            >
              {leaveTypes.map(lv => 
                <option key={lv.id} value={lv.id}>
                  {lv.name} (Max: {lv.maxDays} days)
                </option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                dateFormat="yyyy-MM-dd"
                minDate={startDate}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Total Days: <span className="text-blue-600 font-bold">{calculateDays()}</span>
              {validating && <span className="text-gray-500 ml-2">Validating...</span>}
            </label>
          </div>

          {/* LOP Information */}
          <AnimatePresence>
            {validationResult.lopInfo?.isLOP && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Loss of Pay (LOP) Alert</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-red-300">
                    <p className="text-gray-600">Available Days</p>
                    <p className="text-lg font-bold text-green-600">{validationResult.lopInfo.availableDays}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-300">
                    <p className="text-gray-600">LOP Days</p>
                    <p className="text-lg font-bold text-red-600">{validationResult.lopInfo.lopDays}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-300">
                    <p className="text-gray-600">Remaining LOP Limit</p>
                    <p className="text-lg font-bold text-orange-600">
                      {validationResult.lopInfo.lopLimitInfo.remainingLOPDays - validationResult.lopInfo.lopDays}
                    </p>
                  </div>
                </div>
                <p className="text-red-700 text-sm mt-3">
                  ⚠️ <strong>{validationResult.lopInfo.lopDays} day(s)</strong> will be deducted from your salary as Loss of Pay.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Results */}
          <AnimatePresence>
            {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {/* Errors */}
                {validationResult.errors.map((error, index) => (
                  <motion.div
                    key={`error-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                ))}

                {/* Warnings */}
                {validationResult.warnings.map((warning, index) => (
                  <motion.div
                    key={`warning-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-700 text-sm">{warning}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conflict Details */}
          <AnimatePresence>
            {conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Leave Timeline Conflicts ({conflicts.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowConflictDetails(!showConflictDetails)}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    {showConflictDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showConflictDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {conflicts.map((conflict, index) => {
                        const leave = conflict.conflictingLeave;
                        const leaveTypeInfo = leaveTypes.find(lt => lt.id === leave.leaveType);
                        
                        return (
                          <div key={index} className="bg-white border border-red-300 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-red-800">
                                {leaveTypeInfo?.name} - {leave.id}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                leave.status === 'approved' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {leave.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Dates:</strong> {leave.startDate} to {leave.endDate} ({leave.days} days)
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Reason:</strong> {leave.reason}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              <strong>Conflict:</strong> {conflict.overlapType.replace('_', ' ')}
                            </p>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-semibold mb-2">Reason</label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for your leave..."
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/200 characters</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={submitting || validationResult.errors.length > 0}
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Apply
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <AlertCircle className="text-yellow-500" />
            <span className="text-xs text-gray-500">
              {validationResult.lopInfo?.isLOP 
                ? `⚠️ ${validationResult.lopInfo.lopDays} LOP day(s) - Review before submitting`
                : conflicts.length > 0 
                ? 'Conflicts detected - review before submitting' 
                : `Request will be sent to ${approver?.name || 'your approver'} for approval`
              }
            </span>
          </div>
        </form>
      </motion.div>

      {/* Employee Timeline with Cancellation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Your Leave Timeline
        </h3>
        
        {timeline.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming or pending leaves</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((leave, index) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: leave.leaveTypeInfo?.color || '#6b7280' }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {leave.leaveTypeInfo?.name} - {leave.id}
                      {leave.isLOP && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          LOP: {leave.lopDays} days
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {leave.startDate} to {leave.endDate} ({leave.days} days)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : leave.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : leave.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {leave.status.toUpperCase()}
                  </span>
                  {canCancelRequest(leave) && (
                    <button
                      onClick={() => handleCancel(leave.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      title="Cancel Request"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ApplyLeave;
