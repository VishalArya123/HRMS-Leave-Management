import React, { useState, useEffect } from 'react';
import { dataManager } from '../utils/dataManager';
import { sendEmail, emailTemplates } from '../utils/emailService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown, MessageSquare, Loader, Users } from 'lucide-react';

const Approvals = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading approval data for user:', user.id, user.role);
      
      const [employeesData, typesData] = await Promise.all([
        dataManager.getEmployees(),
        dataManager.getLeaveTypes()
      ]);

      setEmployees(employeesData);
      setLeaveTypes(typesData);

      // Get pending requests where current user is the approver
      const pendingRequests = await dataManager.getPendingRequestsForApprover(user.id);
      console.log('📊 Pending requests for approver:', pendingRequests.length);

      setLeaveRequests(pendingRequests);
    } catch (error) {
      toast.error('Failed to load approval data');
      console.error('❌ Load approvals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    console.log('👍 Initiating approval for request:', request.id);
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleReject = (request) => {
    console.log('👎 Initiating rejection for request:', request.id);
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    console.log('🔄 Processing approval for request:', selectedRequest.id);
    
    try {
      // Update request status
      await dataManager.updateLeaveRequestStatus(
        selectedRequest.id,
        'approved',
        approvalComments || `Approved by ${user.name} (${user.role})`,
        ''
      );
      console.log('✅ Request status updated to approved');

      // Update leave balance
      await dataManager.updateLeaveBalance(
        selectedRequest.employeeId,
        selectedRequest.leaveType,
        selectedRequest.days
      );
      console.log('✅ Leave balance updated');

      // Get employee details for email
      const employee = employees.find(e => e.id === selectedRequest.employeeId);
      const leaveTypeInfo = leaveTypes.find(lt => lt.id === selectedRequest.leaveType);

      console.log('👤 Employee details:', employee);
      console.log('📧 Sending approval email to:', employee?.personalEmail || employee?.email);

      // Prepare email data
      const emailData = {
        employeeName: employee?.name || 'Employee',
        employeeEmail: employee?.personalEmail || employee?.email,
        managerName: user.name,
        managerRole: user.role,
        leaveType: leaveTypeInfo?.name || selectedRequest.leaveType,
        startDate: selectedRequest.startDate,
        endDate: selectedRequest.endDate,
        days: selectedRequest.days,
        comments: approvalComments || 'Your leave has been approved'
      };

      // Send approval email to employee using template
      const emailParams = emailTemplates.leaveApproval(emailData);
      console.log('📧 Email parameters:', emailParams);

      const emailResult = await sendEmail(emailParams);
      console.log('📧 Email result:', emailResult);

      toast.success(`Leave request ${selectedRequest.id} approved successfully!`);
      
      if (!emailResult.success) {
        toast.warning('Email notification failed to send');
        console.warn('⚠️ Email notification failed');
      }

      // Refresh data
      await loadData();
      
      setShowApprovalModal(false);
      setApprovalComments('');
      setSelectedRequest(null);

    } catch (error) {
      toast.error('Failed to approve leave request');
      console.error('❌ Approval error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    console.log('🔄 Processing rejection for request:', selectedRequest.id);
    
    try {
      // Update request status
      await dataManager.updateLeaveRequestStatus(
        selectedRequest.id,
        'rejected',
        `Rejected by ${user.name} (${user.role})`,
        rejectionReason
      );
      console.log('✅ Request status updated to rejected');

      // Get employee details for email
      const employee = employees.find(e => e.id === selectedRequest.employeeId);
      const leaveTypeInfo = leaveTypes.find(lt => lt.id === selectedRequest.leaveType);

      console.log('👤 Employee details:', employee);
      console.log('📧 Sending rejection email to:', employee?.personalEmail || employee?.email);

      // Prepare email data
      const emailData = {
        employeeName: employee?.name || 'Employee',
        employeeEmail: employee?.personalEmail || employee?.email,
        managerName: user.name,
        managerRole: user.role,
        leaveType: leaveTypeInfo?.name || selectedRequest.leaveType,
        startDate: selectedRequest.startDate,
        endDate: selectedRequest.endDate,
        days: selectedRequest.days,
        rejectionReason: rejectionReason
      };

      // Send rejection email to employee using template
      const emailParams = emailTemplates.leaveRejection(emailData);
      console.log('📧 Email parameters:', emailParams);

      const emailResult = await sendEmail(emailParams);
      console.log('📧 Email result:', emailResult);

      toast.success(`Leave request ${selectedRequest.id} rejected with explanation provided.`);
      
      if (!emailResult.success) {
        toast.warning('Email notification failed to send');
        console.warn('⚠️ Email notification failed');
      }

      // Refresh data
      await loadData();
      
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);

    } catch (error) {
      toast.error('Failed to reject leave request');
      console.error('❌ Rejection error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading approvals...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Approval Role Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Approval Authority
        </h4>
        <p className="text-blue-700 text-sm">
          As a <strong>{user.role}</strong>, you can approve leave requests from:
        </p>
        <ul className="text-blue-600 text-xs mt-2 ml-4">
          {user.role === 'manager' && (
            <li>• Employees in your team who report to you</li>
          )}
          {user.role === 'admin' && (
            <>
              <li>• All managers in the organization</li>
              <li>• Any escalated employee requests</li>
            </>
          )}
        </ul>
      </div>

      <h2 className="text-2xl mb-6 font-bold text-blue-700 flex items-center gap-2">
        <CheckCircle className="h-6 w-6" /> Pending Approvals
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
          {leaveRequests.length}
        </span>
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Applicant</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Leave Type</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Dates</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Days</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Reason</th>
                <th className="py-4 px-6 text-center font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No pending approvals</p>
                    <p className="text-sm">All leave requests have been processed or you don't have any requests to approve.</p>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req, index) => {
                  const emp = employees.find(e => e.id === req.employeeId);
                  const type = leaveTypes.find(lt => lt.id === req.leaveType);
                  
                  return (
                    <motion.tr 
                      key={req.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {emp?.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{emp?.name}</p>
                            <p className="text-sm text-gray-500">{emp?.department}</p>
                            <p className="text-xs text-gray-400">
                              {emp?.role} • {emp?.personalEmail || emp?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: type?.color }}
                        >
                          {type?.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="font-medium">{req.startDate}</p>
                          {req.startDate !== req.endDate && (
                            <p className="text-gray-500">to {req.endDate}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900 max-w-xs truncate" title={req.reason}>
                          {req.reason}
                        </p>
                        {req.hasConflicts && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 mt-1">
                            ⚠️ Has Conflicts
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 text-sm font-medium"
                            onClick={() => handleApprove(req)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 text-sm font-medium"
                            onClick={() => handleReject(req)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Reject
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Approve Leave Request
            </h3>
            <p className="text-gray-600 mb-4">
              Approve leave request from <strong>{employees.find(e => e.id === selectedRequest?.employeeId)?.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments for the employee..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmApproval}
                disabled={processing}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalComments('');
                  setSelectedRequest(null);
                }}
                disabled={processing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Leave Request
            </h3>
            <p className="text-gray-600 mb-4">
              Provide a clear explanation to <strong>{employees.find(e => e.id === selectedRequest?.employeeId)?.name}</strong> for rejecting this leave request:
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this leave request cannot be approved..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This explanation will be shared with the employee.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmRejection}
                disabled={!rejectionReason.trim() || processing}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                disabled={processing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
