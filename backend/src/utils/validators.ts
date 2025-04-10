/**
 * Validation utilities for the authentication system
 */

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates user registration input
 * @param data Registration form data
 * @returns Array of validation errors (empty if valid)
 */
export const validateRegistration = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { email, username, password } = data;

  // Validate email
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }

  // Validate username
  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (username.length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push({
      field: 'username',
      message: 'Username can only contain letters, numbers, and underscores'
    });
  }

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters'
    });
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  return errors;
};

/**
 * Validates user login input
 * @param data Login form data
 * @returns Array of validation errors (empty if valid)
 */
export const validateLogin = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { email, password } = data;

  // Validate email
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

/**
 * Validates password reset input
 * @param data Password reset form data
 * @returns Array of validation errors (empty if valid)
 */
export const validatePasswordReset = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { password, confirmPassword } = data;

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters'
    });
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match'
    });
  }

  return errors;
};

/**
 * Validates profile update input
 * @param data Profile update form data
 * @returns Array of validation errors (empty if valid)
 */
export const validateProfileUpdate = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { username, email } = data;

  // Validate username if provided
  if (username !== undefined) {
    if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }
  }

  // Validate email if provided
  if (email !== undefined && !/\S+@\S+\.\S+/.test(email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }

  return errors;
};
