import React, { useState, useEffect } from 'react';
import { dataManager } from '../utils/dataManager';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, MessageSquare, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const MyLeaves = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, typesData, employeesData] = await Promise.all([
        dataManager.getLeaveRequests(user.id),
        dataManager.getLeaveTypes(),
        dataManager.getEmployees()
      ]);

      setLeaveRequests(requestsData);
      setLeaveTypes(typesData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Failed to load leave data');
      console.error('Load leaves error:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypeMap = Object.fromEntries(leaveTypes.map(lt => [lt.id, lt]));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const showDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your leaves...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl mb-6 font-bold text-blue-700 flex items-center gap-2">
        <FileText className="h-6 w-6" /> My Leave Applications
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
          {leaveRequests.length}
        </span>
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Leave Type</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Dates</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Days</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Status</th>
                <th className="py-4 px-6 text-left font-semibold text-gray-900">Applied On</th>
                <th className="py-4 px-6 text-center font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No leave applications</p>
                    <p className="text-sm">You haven't applied for any leaves yet.</p>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req, index) => {
                  const type = leaveTypeMap[req.leaveType];
                  return (
                    <motion.tr 
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
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
                        <div className="flex items-center gap-2">
                          {getStatusIcon(req.status)}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {req.appliedDate}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => showDetails(req)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Request Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Request ID</label>
                  <p className="font-semibold">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Leave Type</label>
                <p className="font-semibold">{leaveTypeMap[selectedRequest.leaveType]?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Date</label>
                  <p className="font-semibold">{selectedRequest.startDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <p className="font-semibold">{selectedRequest.endDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Total Days</label>
                <p className="font-semibold">{selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Reason</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Manager Comments</label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedRequest.comments}</p>
                </div>
              )}

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-red-600">Rejection Reason</label>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-800">{selectedRequest.rejectionReason}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label className="block font-medium">Applied On</label>
                  <p>{selectedRequest.appliedDate}</p>
                </div>
                <div>
                  <label className="block font-medium">Approver</label>
                  <p>{employees.find(e => e.id === selectedRequest.approver)?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
