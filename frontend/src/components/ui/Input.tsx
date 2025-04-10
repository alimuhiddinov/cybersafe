import React, { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'md',
  variant = 'outlined',
  containerClassName = '',
  className = '',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  
  const containerClasses = [
    'input-container',
    fullWidth ? 'input-full' : '',
    `input-size-${size}`,
    `input-${variant}`,
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    containerClassName
  ].filter(Boolean).join(' ');
  
  const inputClasses = [
    'input',
    leftIcon ? 'input-with-left-icon' : '',
    rightIcon ? 'input-with-right-icon' : '',
    error ? 'input-has-error' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {leftIcon && (
          <span className="input-icon input-icon-left">
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText ? `${inputId}-helper-text` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <span className="input-icon input-icon-right">
            {rightIcon}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div 
          id={`${inputId}-helper-text`}
          className={`input-helper-text ${error ? 'input-error-text' : ''}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
