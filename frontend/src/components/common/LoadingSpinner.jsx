import React from 'react';

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-10 w-10 border-4",
  lg: "h-16 w-16 border-4"
};

const LoadingSpinner = ({ size = "md", color = "border-blue-500" }) => (
  <div className={`inline-block ${sizes[size]} animate-spin rounded-full border-t-transparent border-solid ${color}`}></div>
);

export default LoadingSpinner;
