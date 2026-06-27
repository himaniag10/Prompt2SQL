import nodemailer from 'nodemailer';
import logger from '../config/logger';

export interface IEmailService {
  sendVerificationOTP(to: string, otp: string): Promise<any>;
  sendPasswordResetOTP(to: string, otp: string): Promise<any>;
}

export class GmailEmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      if (this.isDevelopment) {
        logger.warn('Gmail credentials (EMAIL_USER or EMAIL_PASS) are missing. Email sending will be bypassed in development.');
      } else {
        logger.error('CRITICAL: Gmail credentials are missing in production!');
      }
    } else {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    }
  }

  private generateHtml(title: string, message: string, otp: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-w-md mx-auto; p-6 border rounded-lg bg-white">
        <h2 style="color: #5c0f1c; text-align: center;">${title}</h2>
        <p style="color: #2d2d2d;">Hello,</p>
        <p style="color: #2d2d2d;">${message}</p>
        
        <div style="background-color: #faf9f6; border: 1px dashed #c19b6c; padding: 20px; text-align: center; margin: 24px 0; border-radius: 8px;">
          <h1 style="font-size: 32px; letter-spacing: 4px; color: #5c0f1c; margin: 0;">${otp}</h1>
        </div>
        
        <p style="color: #71717a; font-size: 14px;">If you didn't request this code, you can safely ignore this email. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e6dfd5; margin: 24px 0;" />
        <p style="color: #71717a; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Prompt2SQL. All rights reserved.</p>
      </div>
    `;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      logger.info(`[Email Bypassed] Would have sent to ${to} with subject: ${subject}`);
      return { id: 'bypassed-in-dev' };
    }

    try {
      const from = process.env.EMAIL_FROM || 'Prompt2SQL <noreply@prompt2sql.com>';
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      return info;
    } catch (error) {
      logger.error('Failed to send email via Gmail (Nodemailer)', error);
      throw new Error('Could not send email');
    }
  }

  async sendVerificationOTP(to: string, otp: string) {
    const html = this.generateHtml(
      'Verify Your Account',
      'Please use the following 6-digit code to verify your email address. This code will expire in 5 minutes.',
      otp
    );
    return this.sendEmail(to, 'Your Prompt2SQL Verification Code', html);
  }

  async sendPasswordResetOTP(to: string, otp: string) {
    const html = this.generateHtml(
      'Reset Your Password',
      'Please use the following 6-digit code to reset your password. This code will expire in 5 minutes.',
      otp
    );
    return this.sendEmail(to, 'Your Prompt2SQL Password Reset Code', html);
  }
}

export const emailService: IEmailService = new GmailEmailService();
