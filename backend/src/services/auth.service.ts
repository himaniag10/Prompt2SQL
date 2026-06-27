import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { emailService } from './email.service';
import { RegisterInput, LoginInput, VerifyEmailInput, ResendOtpInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validator';
import { JwtPayload } from '../types/auth.types';
import crypto from 'crypto';

export class AuthService {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(data: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Cooldown check
    const existingOtp = await authRepository.findOtpByEmailAndPurpose(data.email, 'EMAIL_VERIFICATION');
    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      throw new Error('Please wait 60 seconds before requesting a new OTP');
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Save OTP with payload
    await authRepository.createOtp({
      email: data.email,
      otpHash,
      purpose: 'EMAIL_VERIFICATION',
      payload: { name: data.name, passwordHash },
      expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes
    });

    // Send email
    await emailService.sendVerificationOTP(data.email, otp);

    return { message: 'OTP sent successfully to email' };
  }

  async verifyEmail(data: VerifyEmailInput) {
    const otpRecord = await authRepository.findOtpByEmailAndPurpose(data.email, 'EMAIL_VERIFICATION');
    
    if (!otpRecord) throw new Error('Invalid or expired OTP');
    if (otpRecord.attempts >= 5) throw new Error('Maximum verification attempts exceeded');
    if (otpRecord.expiresAt.getTime() < Date.now()) throw new Error('OTP has expired');

    const isValid = await bcrypt.compare(data.otp, otpRecord.otpHash);
    
    if (!isValid) {
      await authRepository.incrementOtpAttempts(otpRecord.id);
      throw new Error('Invalid OTP');
    }

    // OTP valid. Extract payload and create user.
    const payload = otpRecord.payload as { name: string, passwordHash: string };
    
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      await authRepository.deleteOtp(otpRecord.id);
      throw new Error('User with this email already exists');
    }

    const user = await authRepository.createUser({
      name: payload.name,
      email: data.email,
      password: payload.passwordHash,
    });

    await authRepository.deleteOtp(otpRecord.id);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async resendOtp(data: ResendOtpInput) {
    const existingOtp = await authRepository.findOtpByEmailAndPurpose(data.email, 'EMAIL_VERIFICATION');
    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      throw new Error('Please wait 60 seconds before requesting a new OTP');
    }

    // We need the payload to generate a new OTP for registration if the user doesn't exist yet
    // If the user already exists, maybe they are trying to verify a new device, but for now we only support EMAIL_VERIFICATION for registration.
    if (!existingOtp) {
      throw new Error('No pending registration found for this email');
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete old one and create new
    await authRepository.deleteOtp(existingOtp.id);
    
    await authRepository.createOtp({
      email: data.email,
      otpHash,
      purpose: 'EMAIL_VERIFICATION',
      payload: existingOtp.payload!,
      expiresAt: new Date(Date.now() + 5 * 60000),
    });

    await emailService.sendVerificationOTP(data.email, otp);

    return { message: 'New OTP sent successfully' };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If an account with that email exists, we sent a password reset link.' };
    }

    const existingOtp = await authRepository.findOtpByEmailAndPurpose(data.email, 'PASSWORD_RESET');
    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      throw new Error('Please wait 60 seconds before requesting a new OTP');
    }
    
    if (existingOtp) {
      await authRepository.deleteOtp(existingOtp.id);
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await authRepository.createOtp({
      email: data.email,
      otpHash,
      purpose: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes
    });

    await emailService.sendPasswordResetOTP(data.email, otp);

    return { message: 'If an account with that email exists, we sent a password reset link.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const otpRecord = await authRepository.findOtpByEmailAndPurpose(data.email, 'PASSWORD_RESET');
    
    if (!otpRecord) throw new Error('Invalid or expired OTP');
    if (otpRecord.attempts >= 5) throw new Error('Maximum verification attempts exceeded');
    if (otpRecord.expiresAt.getTime() < Date.now()) throw new Error('OTP has expired');

    const isValid = await bcrypt.compare(data.otp, otpRecord.otpHash);
    
    if (!isValid) {
      await authRepository.incrementOtpAttempts(otpRecord.id);
      throw new Error('Invalid OTP');
    }

    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await authRepository.updateUserPassword(user.id, passwordHash);
    
    await authRepository.deleteOtp(otpRecord.id);

    return { message: 'Password has been reset successfully' };
  }

  async login(data: LoginInput) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d' }
    );

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getUserById(id: string) {
    const user = await authRepository.findUserById(id);
    if (!user) throw new Error('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
