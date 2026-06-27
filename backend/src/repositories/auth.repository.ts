import { prisma } from '../shared/db/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async updateUserPassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });
  }

  // OTP Operations
  async createOtp(data: Prisma.OtpCreateInput) {
    return prisma.otp.create({ data });
  }

  async findOtpByEmailAndPurpose(email: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    return prisma.otp.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementOtpAttempts(id: string) {
    return prisma.otp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async deleteOtp(id: string) {
    return prisma.otp.delete({ where: { id } });
  }
}

export const authRepository = new AuthRepository();
