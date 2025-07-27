// Email notification simulator for leave management

export const sendEmailNotification = async (type, data) => {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const notifications = {
      leave_applied: {
        to: data.managerEmail,
        subject: `Leave Application - ${data.employeeName}`,
        body: `
          Dear Manager,
          
          ${data.employeeName} has applied for ${data.leaveType} leave.
          
          Details:
          - Duration: ${data.startDate} to ${data.endDate}
          - Days: ${data.days}
          - Reason: ${data.reason}
          
          Please review and approve/reject this request.
          
          Best regards,
          HRMS System
        `
      },
      leave_approved: {
        to: data.employeeEmail,
        subject: `Leave Approved - ${data.leaveType}`,
        body: `
          Dear ${data.employeeName},
          
          Your ${data.leaveType} leave request has been approved.
          
          Details:
          - Duration: ${data.startDate} to ${data.endDate}
          - Days: ${data.days}
          - Manager Comments: ${data.comments}
          
          Enjoy your time off!
          
          Best regards,
          HR Team
        `
      },
      leave_rejected: {
        to: data.employeeEmail,
        subject: `Leave Request Update - ${data.leaveType}`,
        body: `
          Dear ${data.employeeName},
          
          We regret to inform you that your ${data.leaveType} leave request has been declined.
          
          Details:
          - Duration: ${data.startDate} to ${data.endDate}
          - Days: ${data.days}
          
          Reason for rejection:
          ${data.rejectionReason}
          
          Please feel free to discuss this with your manager or HR for clarification.
          
          Best regards,
          HR Team
        `
      }
    };
  
    const notification = notifications[type];
    if (notification) {
      console.log('📧 Email Sent:', notification);
      return { success: true, message: 'Email notification sent successfully' };
    }
    
    return { success: false, message: 'Invalid notification type' };
  };
  
  // Email templates for different scenarios
  export const emailTemplates = {
    upcomingLeaveReminder: (data) => ({
      subject: `Upcoming Leave Reminder - ${data.leaveType}`,
      body: `Your ${data.leaveType} leave starts on ${data.startDate}. Safe travels!`
    }),
    
    leaveBalanceAlert: (data) => ({
      subject: 'Leave Balance Alert',
      body: `Your ${data.leaveType} balance is running low: ${data.remaining} days remaining.`
    }),
    
    holidayNotification: (data) => ({
      subject: `Holiday Notification - ${data.holidayName}`,
      body: `Reminder: ${data.holidayName} is on ${data.date}. Office will be closed.`
    })
  };
  