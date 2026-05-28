import crypto from "node:crypto";
import type { Document } from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../config/jwt.js";
import { User, type IUser, type UserRole } from "../models/User.js";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  schoolId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id.toString(),
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    status: user.isActive,
    lastLoginAt: user.lastLogin || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    
    // Split full name to first and last
    const nameParts = input.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const user = (await User.create({
      firstName,
      lastName,
      email: input.email,
      passwordHash,
      role: input.role ?? "STUDENT",
      ...(input.schoolId ? { schoolId: input.schoolId } : {}),
    })) as IUser & Document;

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      fullName: input.fullName,
      role: user.role,
    });

    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
    const user = (await User.findOne({ email: input.email.toLowerCase() })) as (IUser & Document) | null;

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account is currently inactive");
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    user.lastLogin = new Date();
    
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
    });

    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    user.refreshToken = refreshToken;
    await user.save();

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const user = (await User.findById(payload.sub)) as (IUser & Document) | null;

      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, "Invalid refresh token");
      }

      if (!user.isActive) {
        throw new ApiError(403, "This account is currently inactive");
      }

      const accessToken = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      });

      const newRefreshToken = signRefreshToken({ sub: user._id.toString() });
      user.refreshToken = newRefreshToken;
      await user.save();

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = (await User.findById(userId)) as (IUser & Document) | null;

    if (!user) {
      throw new ApiError(404, "Authenticated user not found");
    }

    return toPublicUser(user);
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return { message: "If that email is registered, a password reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    // In a real app, send an email here with `resetToken`.
    // Returning it for development purposes only.
    return { 
      message: "If that email is registered, a password reset link has been sent.",
      resetToken 
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Invalidate existing sessions
    user.refreshToken = undefined;
    
    await user.save();
  }
}