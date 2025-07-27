import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataManager } from '../utils/dataManager';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import {
    Users,
    Calendar,
    Settings,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    UserPlus,
    CalendarPlus,
    AlertCircle,
    CheckCircle,
    Building,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('employees');
    const [employees, setEmployees] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Employee Management States
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({
        id: '',
        name: '',
        email: '',
        personalEmail: '',
        role: 'employee',
        department: '',
        manager: ''
    });

    // Holiday Management States
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [holidayForm, setHolidayForm] = useState({
        date: new Date(),
        name: '',
        type: 'national'
    });

    // Leave Quota Management States
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [quotaForm, setQuotaForm] = useState({
        employeeId: '',
        leaveType: '',
        allocated: 0,
        used: 0,
        pending: 0
    });

    // Events Management States
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: new Date(),
        type: 'meeting',
        priority: 'medium'
    });

    useEffect(() => {
        if (user?.role !== 'admin') {
            toast.error('Admin access required');
            return;
        }
        loadAdminData();
    }, [user]);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [employeesData, holidaysData, leaveTypesData] = await Promise.all([
                dataManager.getEmployees(),
                dataManager.getHolidays(),
                dataManager.getLeaveTypes()
            ]);

            setEmployees(employeesData);
            setHolidays(holidaysData);
            setLeaveTypes(leaveTypesData);

            // Load events (mock data for now)
            setEvents([
                { id: 1, title: 'Team Meeting', description: 'Monthly review', date: '2025-08-15', type: 'meeting', priority: 'high' },
                { id: 2, title: 'Training Session', description: 'New employee onboarding', date: '2025-08-20', type: 'training', priority: 'medium' }
            ]);

        } catch (error) {
            console.error('Failed to load admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    // Employee Management Functions
    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                // Update existing employee
                await dataManager.updateEmployee(editingEmployee.id, employeeForm);
                toast.success('Employee updated successfully');
            } else {
                // Add new employee
                await dataManager.addEmployee(employeeForm);
                toast.success('Employee added successfully');
            }

            setShowEmployeeModal(false);
            setEditingEmployee(null);
            resetEmployeeForm();
            loadAdminData();
        } catch (error) {
            toast.error(error.message || 'Failed to save employee');
        }
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        setEmployeeForm({ ...employee });
        setShowEmployeeModal(true);
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await dataManager.deleteEmployee(employeeId);
                toast.success('Employee deleted successfully');
                loadAdminData();
            } catch (error) {
                toast.error('Failed to delete employee');
            }
        }
    };

    const resetEmployeeForm = () => {
        setEmployeeForm({
            id: '',
            name: '',
            email: '',
            personalEmail: '',
            role: 'employee',
            department: '',
            manager: ''
        });
    };

    // Holiday Management Functions
    const handleHolidaySubmit = async (e) => {
        e.preventDefault();
        try {
            const holidayData = {
                date: holidayForm.date.toISOString().slice(0, 10),
                name: holidayForm.name,
                type: holidayForm.type
            };

            await dataManager.addHoliday(holidayData);
            toast.success('Holiday added successfully');
            setShowHolidayModal(false);
            setHolidayForm({ date: new Date(), name: '', type: 'national' });
            loadAdminData();
        } catch (error) {
            toast.error('Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (holidayDate) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await dataManager.deleteHoliday(holidayDate);
                toast.success('Holiday deleted successfully');
                loadAdminData();
            } catch (error) {
                toast.error('Failed to delete holiday');
            }
        }
    };

    // Leave Quota Management Functions
    const handleQuotaSubmit = async (e) => {
        e.preventDefault();
        try {
            await dataManager.updateLeaveQuota(quotaForm);
            toast.success('Leave quota updated successfully');
            setShowQuotaModal(false);
            setQuotaForm({ employeeId: '', leaveType: '', allocated: 0, used: 0, pending: 0 });
            loadAdminData();
        } catch (error) {
            toast.error('Failed to update leave quota');
        }
    };

    // Event Management Functions
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = {
                id: events.length + 1,
                title: eventForm.title,
                description: eventForm.description,
                date: eventForm.date.toISOString().slice(0, 10),
                type: eventForm.type,
                priority: eventForm.priority
            };

            setEvents([...events, eventData]);
            toast.success('Event added successfully');
            setShowEventModal(false);
            setEventForm({ title: '', description: '', date: new Date(), type: 'meeting', priority: 'medium' });
        } catch (error) {
            toast.error('Failed to add event');
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You need admin privileges to access this panel.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-blue-600" />
                    Admin Panel
                </h1>
                <p className="text-gray-600 mt-2">Manage employees, holidays, events, and system settings</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'employees', label: 'Employee Management', icon: Users },
                            { id: 'holidays', label: 'Holiday Management', icon: Calendar },
                            { id: 'events', label: 'Events & Announcements', icon: CalendarPlus },
                            { id: 'quotas', label: 'Leave Quota Management', icon: Settings }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'employees' && (
                    <motion.div
                        key="employees"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Employee Management Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
                                <button
                                    onClick={() => {
                                        resetEmployeeForm();
                                        setShowEmployeeModal(true);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Add Employee
                                </button>
                            </div>

                            {/* Employee List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {employees.map((employee) => (
                                    <motion.div
                                        key={employee.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                                <p className="text-sm text-gray-600">{employee.id}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.role === 'admin'
                                                ? 'bg-red-100 text-red-700'
                                                : employee.role === 'manager'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {employee.role.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {employee.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                {employee.department}
                                            </div>
                                            {employee.manager && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    Manager: {employees.find(e => e.id === employee.manager)?.name || employee.manager}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={() => handleEditEmployee(employee)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                disabled={employee.role === 'admin'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'holidays' && (
                    <motion.div
                        key="holidays"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Holiday Management */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Holiday Management</h2>
                                <button
                                    onClick={() => setShowHolidayModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add Holiday
                                </button>
                            </div>

                            {/* Holiday List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {holidays.map((holiday) => (
                                    <motion.div
                                        key={holiday.date}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">{holiday.name}</h3>
                                            <button
                                                onClick={() => handleDeleteHoliday(holiday.date)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{holiday.date}</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${holiday.type === 'national'
                                            ? 'bg-blue-100 text-blue-700'
                                            : holiday.type === 'festival'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {holiday.type.toUpperCase()}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'events' && (
                    <motion.div
                        key="events"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Events Management */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Events & Announcements</h2>
                                <button
                                    onClick={() => setShowEventModal(true)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add Event
                                </button>
                            </div>

                            {/* Events List */}
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority === 'high'
                                                        ? 'bg-red-100 text-red-700'
                                                        : event.priority === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {event.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>📅 {event.date}</span>
                                                    <span>🏷️ {event.type}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'quotas' && (
                    <motion.div
                        key="quotas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Leave Quota Management */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Leave Quota Management</h2>
                                <button
                                    onClick={() => {
                                        setQuotaForm({
                                            employeeId: '',
                                            leaveType: '',
                                            allocated: 0,
                                            used: 0,
                                            pending: 0
                                        });
                                        setShowQuotaModal(true);
                                    }}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
                                >
                                    <Settings className="h-5 w-5" />
                                    Update Quota
                                </button>
                            </div>

                            {/* Employee Leave Balances Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Leave Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Allocated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Used
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pending
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Available
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {employees.map((employee) =>
                                            leaveTypes.map((leaveType) => {
                                                // Find existing balance or create default
                                                const existingBalance = employee.leaveBalances?.find(
                                                    b => b.leaveType === leaveType.id
                                                ) || {
                                                    allocated: leaveType.maxDays,
                                                    used: 0,
                                                    pending: 0
                                                };
                                                const available = existingBalance.allocated - existingBalance.used - existingBalance.pending;

                                                return (
                                                    <tr key={`${employee.id}-${leaveType.id}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {employee.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                                style={{ backgroundColor: leaveType.color + '20', color: leaveType.color }}
                                                            >
                                                                {leaveType.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {existingBalance.allocated}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {existingBalance.used}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {existingBalance.pending}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className={available < 0 ? 'text-red-600' : 'text-green-600'}>
                                                                {available}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <button
                                                                onClick={() => {
                                                                    setQuotaForm({
                                                                        employeeId: employee.id,
                                                                        leaveType: leaveType.id,
                                                                        allocated: existingBalance.allocated,
                                                                        used: existingBalance.used,
                                                                        pending: existingBalance.pending
                                                                    });
                                                                    setShowQuotaModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Employee Modal */}
            <AnimatePresence>
                {showEmployeeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                                </h3>
                                <button
                                    onClick={() => setShowEmployeeModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.id}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={editingEmployee}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.name}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        value={employeeForm.email}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Personal Email
                                    </label>
                                    <input
                                        type="email"
                                        value={employeeForm.personalEmail}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, personalEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={employeeForm.role}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        value={employeeForm.department}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>

                                {employeeForm.role !== 'admin' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Manager
                                        </label>
                                        <select
                                            value={employeeForm.manager}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, manager: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required={employeeForm.role !== 'admin'}
                                        >
                                            <option value="">Select Manager</option>
                                            {employees
                                                .filter(emp => emp.role === 'manager' || emp.role === 'admin')
                                                .filter(emp => emp.id !== employeeForm.id)
                                                .map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.name} ({manager.role})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editingEmployee ? 'Update' : 'Add'} Employee
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmployeeModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Holiday Modal */}
            <AnimatePresence>
                {showHolidayModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add New Holiday</h3>
                                <button
                                    onClick={() => setShowHolidayModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleHolidaySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Holiday Date
                                    </label>
                                    <DatePicker
                                        selected={holidayForm.date}
                                        onChange={(date) => setHolidayForm({ ...holidayForm, date })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        dateFormat="yyyy-MM-dd"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Holiday Name
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayForm.name}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Independence Day"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Holiday Type
                                    </label>
                                    <select
                                        value={holidayForm.type}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="national">National Holiday</option>
                                        <option value="festival">Festival</option>
                                        <option value="regional">Regional Holiday</option>
                                        <option value="company">Company Holiday</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Add Holiday
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowHolidayModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Event Modal */}
            <AnimatePresence>
                {showEventModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add New Event</h3>
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEventSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        value={eventForm.title}
                                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Team Meeting"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={eventForm.description}
                                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Event details..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Date
                                    </label>
                                    <DatePicker
                                        selected={eventForm.date}
                                        onChange={(date) => setEventForm({ ...eventForm, date })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        dateFormat="yyyy-MM-dd"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Type
                                        </label>
                                        <select
                                            value={eventForm.type}
                                            onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="meeting">Meeting</option>
                                            <option value="training">Training</option>
                                            <option value="announcement">Announcement</option>
                                            <option value="celebration">Celebration</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={eventForm.priority}
                                            onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Add Event
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEventModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/*Quota Modal */}
            <AnimatePresence>
                {showQuotaModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Update Leave Quota</h3>
                                <button
                                    onClick={() => setShowQuotaModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleQuotaSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee
                                    </label>
                                    <select
                                        value={quotaForm.employeeId}
                                        onChange={(e) => setQuotaForm({ ...quotaForm, employeeId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.department})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Leave Type
                                    </label>
                                    <select
                                        value={quotaForm.leaveType}
                                        onChange={(e) => setQuotaForm({ ...quotaForm, leaveType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Leave Type</option>
                                        {leaveTypes.map(lt => (
                                            <option key={lt.id} value={lt.id}>
                                                {lt.name} (Default: {lt.maxDays} days)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Allocated
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={quotaForm.allocated}
                                            onChange={(e) => setQuotaForm({ ...quotaForm, allocated: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Used
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={quotaForm.used}
                                            onChange={(e) => setQuotaForm({ ...quotaForm, used: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pending
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={quotaForm.pending}
                                            onChange={(e) => setQuotaForm({ ...quotaForm, pending: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>Available:</strong> {quotaForm.allocated - quotaForm.used - quotaForm.pending} days
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Update Quota
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowQuotaModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
