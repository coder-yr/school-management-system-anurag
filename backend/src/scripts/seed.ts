import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { School } from '../models/School.js';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permission.js';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';

const permissionsList = [
  { name: 'VIEW_STUDENT', module: 'STUDENT', description: 'View student details' },
  { name: 'CREATE_STUDENT', module: 'STUDENT', description: 'Create new student' },
  { name: 'EDIT_STUDENT', module: 'STUDENT', description: 'Edit student details' },
  { name: 'DELETE_STUDENT', module: 'STUDENT', description: 'Delete student' },
  { name: 'VIEW_ATTENDANCE', module: 'ATTENDANCE', description: 'View attendance records' },
  { name: 'MARK_ATTENDANCE', module: 'ATTENDANCE', description: 'Mark student attendance' },
  { name: 'VIEW_FEES', module: 'FINANCE', description: 'View fee details' },
  { name: 'MANAGE_FEES', module: 'FINANCE', description: 'Manage fee structures and payments' },
  { name: 'VIEW_REPORTS', module: 'REPORTING', description: 'View academic and financial reports' },
  { name: 'MANAGE_USERS', module: 'ADMINISTRATION', description: 'Manage system users' },
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // 1. Seed Permissions
    console.log('Seeding permissions...');
    const permissionDocs = [];
    for (const perm of permissionsList) {
      const updatedPerm = await Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true }
      );
      permissionDocs.push(updatedPerm);
    }
    console.log(`${permissionDocs.length} permissions seeded.`);

    // 2. Create Default School
    let school = await School.findOne({ code: 'DEFAULT_SCH' });
    if (!school) {
      school = new School({
        name: 'Default International School',
        code: 'DEFAULT_SCH',
        contactEmail: 'contact@school.com',
        isActive: true,
      });
      await school.save();
      console.log('Default school created.');
    } else {
      console.log('Default school already exists.');
    }

    // 3. Seed Roles
    console.log('Seeding roles for default school...');
    
    // School Admin Role - all permissions
    const schoolAdminRole = await Role.findOneAndUpdate(
      { name: 'SCHOOL_ADMIN', schoolId: school._id },
      { 
        name: 'SCHOOL_ADMIN', 
        schoolId: school._id, 
        permissions: permissionDocs.map(p => p._id)
      },
      { upsert: true, new: true }
    );

    // Teacher Role
    const teacherPerms = permissionDocs.filter(p => 
      ['VIEW_STUDENT', 'VIEW_ATTENDANCE', 'MARK_ATTENDANCE', 'VIEW_REPORTS'].includes(p.name)
    );
    const teacherRole = await Role.findOneAndUpdate(
      { name: 'TEACHER', schoolId: school._id },
      { 
        name: 'TEACHER', 
        schoolId: school._id, 
        permissions: teacherPerms.map(p => p._id)
      },
      { upsert: true, new: true }
    );

    // Parent Role
    const parentPerms = permissionDocs.filter(p => 
      ['VIEW_STUDENT', 'VIEW_ATTENDANCE', 'VIEW_FEES', 'VIEW_REPORTS'].includes(p.name)
    );
    const parentRole = await Role.findOneAndUpdate(
      { name: 'PARENT', schoolId: school._id },
      { 
        name: 'PARENT', 
        schoolId: school._id, 
        permissions: parentPerms.map(p => p._id)
      },
      { upsert: true, new: true }
    );

    // Student Role
    const studentPerms = permissionDocs.filter(p => 
      ['VIEW_STUDENT', 'VIEW_ATTENDANCE', 'VIEW_FEES', 'VIEW_REPORTS'].includes(p.name)
    );
    const studentRole = await Role.findOneAndUpdate(
      { name: 'STUDENT', schoolId: school._id },
      { 
        name: 'STUDENT', 
        schoolId: school._id, 
        permissions: studentPerms.map(p => p._id)
      },
      { upsert: true, new: true }
    );

    // 4. Seed Users
    // Insert Super Admin User (No Role document needed as SUPER_ADMIN bypasses RBAC)
    const existingAdmin = await User.findOne({ email: 'admin@school.com' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('123', 10);
      const superAdmin = new User({
        email: 'admin@school.com',
        passwordHash,
        firstName: 'Priya',
        lastName: 'Menon',
        role: 'SUPER_ADMIN',
        schoolId: school._id,
        isActive: true,
      });
      await superAdmin.save();
      console.log('Super Admin user created (admin@school.com / 123).');
    }

    // Teacher
    const existingTeacher = await User.findOne({ email: 'teacher@school.com' });
    if (!existingTeacher) {
      const passwordHash = await bcrypt.hash('123', 10);
      const teacher = new User({
        email: 'teacher@school.com',
        passwordHash,
        firstName: 'Anita',
        lastName: 'Iyer',
        role: 'TEACHER', // Links dynamically to role logic
        schoolId: school._id,
        isActive: true,
      });
      await teacher.save();
      console.log('Teacher user created (teacher@school.com / 123).');
    }
    
    // Student
    const existingStudent = await User.findOne({ email: 'student@school.com' });
    if (!existingStudent) {
      const passwordHash = await bcrypt.hash('123', 10);
      const student = new User({
        email: 'student@school.com',
        passwordHash,
        firstName: 'Aarav',
        lastName: 'Sharma',
        role: 'STUDENT',
        schoolId: school._id,
        isActive: true,
      });
      await student.save();
      console.log('Student user created (student@school.com / 123).');
    }
    
    // Parent
    const existingParent = await User.findOne({ email: 'parent@school.com' });
    if (!existingParent) {
      const passwordHash = await bcrypt.hash('123', 10);
      const parent = new User({
        email: 'parent@school.com',
        passwordHash,
        firstName: 'Ramesh',
        lastName: 'Sharma',
        role: 'PARENT',
        schoolId: school._id,
        isActive: true,
      });
      await parent.save();
      console.log('Parent user created (parent@school.com / 123).');
    }
    
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
