import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, verifyEmailSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { AuthRequest } from '../types/auth.types';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = registerSchema.parse(req.body);
      const result = await authService.register(parsedData);
      
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const parsedData = verifyEmailSchema.parse(req.body);
      const user = await authService.verifyEmail(parsedData);

      const tokens = authService.generateTokens({ userId: user.id, role: user.role });

      res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const parsedData = resendOtpSchema.parse(req.body);
      const result = await authService.resendOtp(parsedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(parsedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const parsedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(parsedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = loginSchema.parse(req.body);
      const user = await authService.login(parsedData);

      const tokens = authService.generateTokens({ userId: user.id, role: user.role });

      res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token not found' });
      }

      const payload = authService.verifyRefreshToken(refreshToken);
      const user = await authService.getUserById(payload.userId);

      const tokens = authService.generateTokens({ userId: user.id, role: user.role });

      res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await authService.getUserById(req.user.userId);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
