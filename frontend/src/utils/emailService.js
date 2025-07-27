import emailjs from '@emailjs/browser';

// EmailJS Configuration - Gets values from .env file
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  TEMPLATES: {
    LEAVE_APPLICATION: import.meta.env.VITE_EMAILJS_TEMPLATE_LEAVE_APP,
    LEAVE_RESPONSE: import.meta.env.VITE_EMAILJS_TEMPLATE_LEAVE_RESPONSE // Combined template
  }
};

// Initialize EmailJS
if (EMAILJS_CONFIG.PUBLIC_KEY) {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

class EmailService {
  constructor() {
    this.isConfigured = this.checkConfiguration();
    console.log('📧 EmailJS Configuration Status:', this.isConfigured ? 'Configured' : 'Not Configured');
    if (this.isConfigured) {
      console.log('✅ EmailJS Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('✅ Templates Available:', Object.keys(EMAILJS_CONFIG.TEMPLATES));
    }
  }

  checkConfiguration() {
    return !!(EMAILJS_CONFIG.SERVICE_ID && 
             EMAILJS_CONFIG.PUBLIC_KEY && 
             EMAILJS_CONFIG.TEMPLATES.LEAVE_APPLICATION &&
             EMAILJS_CONFIG.TEMPLATES.LEAVE_RESPONSE);
  }

  async sendEmail(templateId, templateParams) {
    if (!this.isConfigured) {
      console.warn('⚠️ EmailJS not configured. Email simulation mode.');
      return this.simulateEmail(templateId, templateParams);
    }

    try {
      console.log('📧 Sending email with EmailJS...');
      console.log('📤 To:', templateParams.to_email);
      console.log('📑 Template:', templateId);
      console.log('📋 Subject Preview:', templateParams.subject || 'No subject');

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateId,
        templateParams
      );

      console.log('✅ Email sent successfully:', response);
      return { success: true, response, message: 'Email sent successfully!' };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Simulation mode for development/testing
  simulateEmail(templateId, templateParams) {
    console.log('📧 EMAIL SIMULATION MODE');
    console.log('='.repeat(60));
    console.log('📤 To:', templateParams.to_email);
    console.log('📑 Template:', templateId);
    console.log('📋 Parameters:', templateParams);
    console.log('='.repeat(60));
    
    return { 
      success: true, 
      simulated: true,
      message: 'Email simulated in console (EmailJS not configured)' 
    };
  }

  // Email template functions
  leaveApplication(data) {
    return {
      templateId: EMAILJS_CONFIG.TEMPLATES.LEAVE_APPLICATION,
      parameters: {
        to_email: data.managerEmail,
        to_name: data.managerName,
        from_name: 'TensorGo HRMS',
        reply_to: 'noreply@tensorgo.com',
        managerName: data.managerName,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        reason: data.reason,
        approverRole: data.approverRole || 'Manager',
        lopWarning: data.lopWarning || '',
        conflictWarning: data.conflictWarning || ''
      }
    };
  }

  // Combined approval/rejection template
  leaveApproval(data) {
    return {
      templateId: EMAILJS_CONFIG.TEMPLATES.LEAVE_RESPONSE,
      parameters: {
        to_email: data.employeeEmail,
        to_name: data.employeeName,
        from_name: 'TensorGo HRMS',
        reply_to: 'noreply@tensorgo.com',
        
        // Employee details
        employeeName: data.employeeName,
        managerName: data.managerName,
        managerRole: data.managerRole || 'Manager',
        
        // Leave details
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        
        // Status flags for conditional rendering
        isApproved: true,
        isRejected: false,
        status: '✅ Approved',
        
        // Approval specific
        comments: data.comments || 'Your leave has been approved.',
        
        // Not used for approval but needed for template
        rejectionReason: ''
      }
    };
  }

  leaveRejection(data) {
    return {
      templateId: EMAILJS_CONFIG.TEMPLATES.LEAVE_RESPONSE,
      parameters: {
        to_email: data.employeeEmail,
        to_name: data.employeeName,
        from_name: 'TensorGo HRMS',
        reply_to: 'noreply@tensorgo.com',
        
        // Employee details
        employeeName: data.employeeName,
        managerName: data.managerName,
        managerRole: data.managerRole || 'Manager',
        
        // Leave details
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        
        // Status flags for conditional rendering
        isApproved: false,
        isRejected: true,
        status: '❌ Declined',
        
        // Rejection specific
        rejectionReason: data.rejectionReason || 'No specific reason provided.',
        
        // Not used for rejection but needed for template
        comments: ''
      }
    };
  }
}

// Create and export service instance
const emailService = new EmailService();

// Export functions for easy use
export const sendEmail = async (emailData) => {
  return await emailService.sendEmail(emailData.templateId, emailData.parameters);
};

export const emailTemplates = {
  leaveApplication: (data) => emailService.leaveApplication(data),
  leaveApproval: (data) => emailService.leaveApproval(data),
  leaveRejection: (data) => emailService.leaveRejection(data)
};

// Export configuration status for debugging
export const isEmailConfigured = () => emailService.isConfigured;

export default emailService;
