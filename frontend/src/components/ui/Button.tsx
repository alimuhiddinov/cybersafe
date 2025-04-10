import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'btn-full' : '';
  const loadingClasses = isLoading ? 'btn-loading' : '';
  
  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin"
          >
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
          </svg>
        </span>
      )}
      
      {leftIcon && !isLoading && <span className="btn-icon-left">{leftIcon}</span>}
      <span className="btn-text">{children}</span>
      {rightIcon && !isLoading && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
};

export default Button;
