import React from 'react';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  let dimensions: string;
  
  switch (size) {
    case 'small':
      dimensions = 'w-4 h-4';
      break;
    case 'large':
      dimensions = 'w-12 h-12';
      break;
    case 'medium':
    default:
      dimensions = 'w-8 h-8';
  }
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${dimensions} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
