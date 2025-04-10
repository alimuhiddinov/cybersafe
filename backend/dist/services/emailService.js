"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
    return nodemailer_1.default.createTransport({
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
const sendEmail = async (options) => {
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
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
/**
 * Send a verification email
 * @param to Recipient email
 * @param verificationToken Token for email verification
 * @returns Promise<boolean> whether email was sent successfully
 */
const sendVerificationEmail = async (to, verificationToken) => {
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
    return (0, exports.sendEmail)({
        to,
        subject: 'Verify Your CyberSafe Account',
        html,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Send a password reset email
 * @param to Recipient email
 * @param resetToken Token for password reset
 * @returns Promise<boolean> whether email was sent successfully
 */
const sendPasswordResetEmail = async (to, resetToken) => {
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
    return (0, exports.sendEmail)({
        to,
        subject: 'Reset Your CyberSafe Password',
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
