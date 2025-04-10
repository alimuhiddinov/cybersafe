import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Types
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Create reusable transporter object using the default SMTP transport
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('Email configuration is incomplete. Email functionality will not work.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an email
 * @param options Email options
 * @returns Promise<boolean> whether email was sent successfully
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send a verification email
 * @param to Recipient email
 * @param verificationToken Token for email verification
 * @returns Promise<boolean> whether email was sent successfully
 */
export const sendVerificationEmail = async (
  to: string,
  verificationToken: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Verify Your CyberSafe Account</h2>
      <p>Thank you for registering with CyberSafe. Please click the button below to verify your email address:</p>
      <a href="${verificationLink}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not sign up for CyberSafe, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your CyberSafe Account',
    html,
  });
};

/**
 * Send a password reset email
 * @param to Recipient email
 * @param resetToken Token for password reset
 * @returns Promise<boolean> whether email was sent successfully
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Reset Your CyberSafe Password</h2>
      <p>You requested a password reset for your CyberSafe account. Please click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your CyberSafe Password',
    html,
  });
};
