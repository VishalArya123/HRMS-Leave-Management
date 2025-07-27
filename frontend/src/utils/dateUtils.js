export const formatDate = (date, format = 'MMM dd, yyyy') => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  export const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  };
  
  export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  