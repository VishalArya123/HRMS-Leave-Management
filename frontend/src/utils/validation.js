import { dataManager } from './dataManager';

export const validateLeaveRequestWithLOP = async (employeeId, startDate, endDate, leaveType, reason, requestedDays) => {
  console.log('🔍 Validating leave request with LOP checks...');
  
  const errors = [];
  const warnings = [];

  // Basic validations
  if (new Date(endDate) < new Date(startDate)) {
    errors.push('End date cannot be before start date');
  }
  
  // if (reason.length < 10) {
  //   warnings.push('Consider providing a more detailed reason (at least 10 characters)');
  // }

  // Weekend validation
  const startDay = new Date(startDate).getDay();
  if (startDay === 0 || startDay === 6) {
    warnings.push('Leave starts on a weekend');
  }

  try {
    // Holiday validation
    const holidays = await dataManager.getHolidays();
    const holidayConflicts = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return holidayDate >= start && holidayDate <= end;
    });

    if (holidayConflicts.length > 0) {
      warnings.push(`Leave period includes ${holidayConflicts.length} holiday(s): ${holidayConflicts.map(h => h.name).join(', ')}`);
    }

    // LOP calculation and validation
    const lopInfo = await dataManager.calculateLOPDays(employeeId, leaveType, requestedDays);
    const lopLimitCheck = await dataManager.checkAnnualLOPLimit(employeeId, lopInfo.lopDays);

    if (lopInfo.lopDays > 0) {
      warnings.push(`⚠️ This request will result in ${lopInfo.lopDays} Loss of Pay (LOP) day(s) as you only have ${lopInfo.availableDays} available days for this leave type.`);
      
      if (!lopLimitCheck.withinLimit) {
        errors.push(`❌ Request exceeds annual LOP limit. You would exceed by ${lopLimitCheck.wouldExceedBy} days. Remaining LOP allowance: ${lopLimitCheck.remainingLOPDays} days.`);
      } else {
        warnings.push(`📊 After this request, you'll have ${lopLimitCheck.remainingLOPDays - lopInfo.lopDays} LOP days remaining for the year.`);
      }
    }

    // Leave conflict validation
    const conflicts = await dataManager.checkLeaveConflicts(employeeId, startDate, endDate);
    
    if (conflicts.length > 0) {
      conflicts.forEach(async(conflict) => {
        const leave = conflict.conflictingLeave;
        const leaveTypes = await dataManager.getLeaveTypes();
        const leaveTypeInfo = leaveTypes.find(lt => lt.id === leave.leaveType);
        
        errors.push(`Leave conflicts with existing ${leave.status} ${leaveTypeInfo?.name || leave.leaveType} from ${leave.startDate} to ${leave.endDate} (Request ID: ${leave.id})`);
      });
    }

    // Return additional LOP info for UI
    return { 
      errors, 
      warnings, 
      lopInfo: {
        lopDays: lopInfo.lopDays,
        availableDays: lopInfo.availableDays,
        isLOP: lopInfo.lopDays > 0,
        lopLimitInfo: lopLimitCheck
      }
    };

  } catch (error) {
    console.error('Error during validation:', error);
    errors.push('Validation failed. Please try again.');
    return { errors, warnings, lopInfo: null };
  }
};

// Original validation function for backward compatibility
export const validateLeaveRequest = validateLeaveRequestWithLOP;

// Other utility functions remain the same
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const calculateWorkingDays = (startDate, endDate, holidays = []) => {
  let count = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!isWeekend(d) && !holidays.includes(d.toISOString().slice(0, 10))) {
      count++;
    }
  }
  return count;
};

export const formatConflictMessage = (conflicts) => {
  if (conflicts.length === 0) return '';
  
  return conflicts.map(conflict => {
    const leave = conflict.conflictingLeave;
    const overlapType = conflict.overlapType;
    
    let message = `Conflicts with ${leave.status} leave (${leave.id}) from ${leave.startDate} to ${leave.endDate}`;
    
    switch (overlapType) {
      case 'completely_within':
        message += ' - Your requested dates fall completely within this existing leave';
        break;
      case 'completely_covers':
        message += ' - Your requested dates completely cover this existing leave';
        break;
      case 'overlaps_start':
        message += ' - Your leave overlaps with the start of this existing leave';
        break;
      case 'overlaps_end':
        message += ' - Your leave overlaps with the end of this existing leave';
        break;
      default:
        message += ' - There is a partial overlap with this existing leave';
    }
    
    return message;
  }).join('\n');
};
