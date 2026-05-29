import crypto from "node:crypto";
import type { Document } from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../config/jwt.js";
import { User, type IUser, type UserRole } from "../models/User.js";
import { School } from "../models/School.js";
import { Student } from "../models/Student.js";
import { Parent } from "../models/Parent.js";
import { Employee } from "../models/Employee.js";
import { Types } from "mongoose";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  schoolId?: string;
  schoolName?: string;
  schoolCode?: string;
  childrenCodes?: string[];
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
  schoolCode?: string;
  studentCode?: string;
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
    
    const nameParts = input.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Resolve schoolId dynamically
    let sId: Types.ObjectId;
    console.log("--- REGISTRATION DEBUG ---");
    console.log("Input payload:", JSON.stringify({ ...input, password: "[REDACTED]" }, null, 2));

    if (input.schoolId) {
      console.log("Using existing schoolId:", input.schoolId);
      sId = new Types.ObjectId(input.schoolId);
    } else if (input.role === 'SUPER_ADMIN' && input.schoolName) {
      console.log("SUPER_ADMIN detected with schoolName:", input.schoolName);
      // Create a new school for the super admin
      const code = input.schoolCode || "SCH-2026-" + Math.floor(1000 + Math.random() * 9000);
      console.log("Creating new School in MongoDB with code:", code);
      
      const school = await School.create({
        name: input.schoolName,
        code,
        contactEmail: input.email,
        isActive: true,
      });
      
      console.log("Successfully created School in DB! School ID:", school._id.toString());
      sId = school._id as Types.ObjectId;
    } else if (input.schoolCode) {
      console.log("Looking up school by code:", input.schoolCode);
      const school = await School.findOne({ code: input.schoolCode });
      if (!school) {
        console.error("Failed to find school with code:", input.schoolCode);
        throw new ApiError(404, "Invalid school code");
      }
      console.log("Found existing school with ID:", school._id.toString());
      sId = school._id as Types.ObjectId;
    } else {
      console.log("Falling back to DEFAULT_SCH");
      let school = await School.findOne({ code: 'DEFAULT_SCH' });
      if (!school) {
        school = await School.create({
          name: 'Default International School',
          code: 'DEFAULT_SCH',
          contactEmail: 'contact@school.com',
          isActive: true,
        });
      }
      sId = school._id as Types.ObjectId;
    }

    const resolvedRole = input.role ?? "STUDENT";

    const user = (await User.create({
      firstName,
      lastName,
      email: input.email,
      passwordHash,
      role: resolvedRole,
      schoolId: sId,
    })) as IUser & Document;

    const uId = user._id as Types.ObjectId;

    // Create sub-profile based on role
    if (resolvedRole === 'STUDENT') {
      const admissionNumber = `ADM_${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Auto-assign to Class 10-A for testing purposes so they show up in UI
      const mongoose = (await import('mongoose')).default;
      let classDoc = await mongoose.model('Class').findOne({ schoolId: sId, name: '10' });
      if (!classDoc) {
        classDoc = await mongoose.model('Class').create({ schoolId: sId, name: '10' });
      }
      let sectionDoc = await mongoose.model('Section').findOne({ schoolId: sId, classId: classDoc._id, name: 'A' });
      if (!sectionDoc) {
        sectionDoc = await mongoose.model('Section').create({ schoolId: sId, classId: classDoc._id, name: 'A' });
      }

      await Student.create({
        schoolId: sId,
        userId: uId,
        admissionNumber,
        rollNumber: '1',
        classId: classDoc._id,
        sectionId: sectionDoc._id,
        dob: new Date('2010-01-01'),
        gender: 'OTHER',
        isActive: true,
        createdBy: uId,
        updatedBy: uId
      });
    } else if (resolvedRole === 'PARENT') {
      const parent = await Parent.create({
        schoolId: sId,
        userId: uId,
        contactPrimary: '9999999999',
        createdBy: uId,
        updatedBy: uId
      });

      if (input.childrenCodes && input.childrenCodes.length > 0) {
        for (const childCode of input.childrenCodes) {
          if (childCode.trim()) {
            await Student.updateMany(
              { schoolId: sId, $or: [{ admissionNumber: childCode.trim() }, { rollNumber: childCode.trim() }] },
              { $addToSet: { parentIds: parent._id } }
            );
          }
        }
      }
    } else if (resolvedRole === 'TEACHER' || resolvedRole === 'DRIVER' || resolvedRole === 'ACCOUNTANT') {
      const employeeId = `EMP_${uId.toString().slice(-6).toUpperCase()}`;
      await Employee.create({
        schoolId: sId,
        userId: uId,
        employeeId,
        employeeType: resolvedRole === 'TEACHER' ? 'TEACHING' : 'NON_TEACHING',
        designation: resolvedRole,
        joiningDate: new Date(),
        isActive: true,
        createdBy: uId,
        updatedBy: uId
      });
    }

    const accessToken = signAccessToken({
      sub: uId.toString(),
      email: user.email,
      fullName: input.fullName,
      role: user.role,
    });

    const refreshToken = signRefreshToken({ sub: uId.toString() });
    
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
    const user = (await User.findById(userId).populate('schoolId')) as any;

    if (!user) {
      throw new ApiError(404, "Authenticated user not found");
    }

    const publicUser = toPublicUser(user);
    if (user.schoolId && user.schoolId.code) {
      publicUser.schoolCode = user.schoolId.code;
    }

    if (user.role === 'STUDENT') {
      const student = await Student.findOne({ userId });
      if (student) {
        publicUser.studentCode = student.admissionNumber || student.rollNumber;
      }
    }

    return publicUser;
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return { message: "If that email is registered, a password reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

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
    
    user.refreshToken = undefined;
    
    await user.save();
  }
}