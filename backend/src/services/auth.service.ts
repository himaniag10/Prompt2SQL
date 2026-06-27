import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { JwtPayload } from '../types/auth.types';

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
