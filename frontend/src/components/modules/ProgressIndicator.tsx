import React from 'react';

type ProgressIndicatorProps = {
  percentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percentage,
  status,
  showLabel = true,
  size = 'medium'
}) => {
  // Map status to color
  const getColorClass = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'NOT_STARTED':
      default:
        return 'bg-gray-500';
    }
  };

  // Map size to height
  const getHeightClass = () => {
    switch (size) {
      case 'small':
        return 'h-1.5';
      case 'large':
        return 'h-4';
      case 'medium':
      default:
        return 'h-2.5';
    }
  };

  // Get label text based on status and percentage
  const getLabelText = () => {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'NOT_STARTED') return 'Not Started';
    return `${Math.round(percentage)}% Complete`;
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-medium ${size === 'small' ? 'text-xs' : ''}`}>
            {getLabelText()}
          </span>
          <span className={`text-sm text-gray-400 ${size === 'small' ? 'text-xs' : ''}`}>
            {status}
          </span>
        </div>
      )}
      <div className={`w-full bg-navy-600 rounded-full ${getHeightClass()}`}>
        <div
          className={`${getHeightClass()} rounded-full transition-all duration-300 ease-in-out ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
