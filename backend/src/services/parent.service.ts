import { Types } from 'mongoose';
import { Parent } from '../models/Parent.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Fee } from '../models/Fee.js';
import { TransportRoute } from '../models/TransportRoute.js';
import { Timetable } from '../models/Timetable.js';
import { Homework } from '../models/Homework.js';

export class ParentService {
  static async getDashboardData(userId: string) {
    // Find the parent record linked to this user
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const parentUser = await User.findById(userId);

    // Find all active students associated with this parent
    const students = await Student.find({
      parentIds: parent._id,
      isActive: true,
      isDeleted: false,
    }).populate('userId', 'firstName lastName')
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    if (!students.length) {
      return {
        parentName: parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : 'Parent',
        children: []
      };
    }

    // Aggregate dashboard info for each child
    const childrenPromises = students.map(async (student: any) => {
      const studentId = student._id;

      // 1. Attendance (mock simplified aggregation)
      // Ideally, we sum up present days / total working days.
      const attendanceRecords = await Attendance.find({
        studentId: studentId,
        status: { $in: ['PRESENT', 'LATE'] }
      });
      // Just returning a dummy string for now based on records or 90%+ if no records (for demo)
      const attendance = attendanceRecords.length > 0 ? `${Math.min(100, 75 + attendanceRecords.length)}%` : "92%";

      // 2. Average Score
      // In a real app, query Result/Exam. For demo, we'll return a static dynamic value.
      const avgScore = "85%";

      // 3. Fee Due
      const fees = await Fee.find({ studentId, status: { $ne: 'PAID' } });
      const totalDue = fees.reduce((sum, f) => sum + (f.amount || 0) - (f.paidAmount || 0), 0);
      const feeDue = totalDue > 0 ? `₹${totalDue}` : "₹0";

      // 4. Timetable (Today's classes)
      // Query Timetable for today (mocking the structure)
      const timetable = await Timetable.find({ classId: student.classId, sectionId: student.sectionId })
        .populate('subjectId', 'name')
        .populate('teacherId', 'firstName lastName')
        .limit(4);

      let todayClasses = [];
      if (timetable.length > 0) {
        todayClasses = timetable.map((t: any) => ({
          time: `${t.startTime} - ${t.endTime}`,
          subject: t.subjectId ? t.subjectId.name : 'Subject',
          room: t.roomId || 'Classroom',
          teacher: t.teacherId ? `${t.teacherId.firstName} ${t.teacherId.lastName}` : 'Teacher'
        }));
      } else {
        // Fallback demo classes if none exist in DB
        todayClasses = [
          { time: "08:30", subject: "Mathematics", room: "201", teacher: "Mr. Iyer" },
          { time: "09:30", subject: "Science", room: "Lab-1", teacher: "Ms. Sharma" }
        ];
      }

      // 5. Homework
      const homeworks = await Homework.find({
        classId: student.classId,
        sectionId: student.sectionId,
        dueDate: { $gte: new Date() }
      }).populate('subjectId', 'name').limit(3);

      let upcomingHomeworks = [];
      if (homeworks.length > 0) {
        upcomingHomeworks = homeworks.map((hw: any) => ({
          subject: hw.subjectId ? hw.subjectId.name : 'Subject',
          title: hw.title,
          due: new Date(hw.dueDate).toLocaleDateString()
        }));
      } else {
        // Fallback demo homeworks
        upcomingHomeworks = [
          { subject: "Mathematics", title: "Algebra Worksheet", due: "Tomorrow" },
        ];
      }

      // 6. Canteen Menu & Health Record (Mocked as per plan, since full schema doesn't exist)
      const canteenMenu = {
        lunch: "Rajma Chawal, Roti, Salad",
        restriction: "Vegetarian"
      };

      const healthRecord = {
        blood: student.bloodGroup || "O+ Pos",
        allergy: student.emergencyContact ? "Check emergency contacts" : "No known allergies",
        lastVisit: "Routine checkup passed."
      };

      const gradeInfo = (student.classId && student.sectionId) ? `Grade ${(student.classId as any).name} · ${(student.sectionId as any).name}` : "Grade N/A";

      return {
        id: studentId.toString(),
        name: student.userId ? `${(student.userId as any).firstName} ${(student.userId as any).lastName}` : 'Student',
        grade: gradeInfo,
        rollNo: student.rollNumber || student.admissionNumber,
        attendance,
        avgScore,
        feeDue,
        busTime: "Arriving in ~ 10 min", // Mocked bus time
        nextClass: todayClasses.length > 0 ? `${todayClasses[0].subject} with ${todayClasses[0].teacher}` : 'N/A',
        todayClasses,
        homeworks: upcomingHomeworks,
        canteenMenu,
        healthRecord
      };
    });

    const resolvedChildren = await Promise.all(childrenPromises);

    // Convert array to a keyed object dictionary by ID or lowercase first name for frontend compatibility
    // The frontend was using "aarav" / "ananya" as keys. We will use the student ID as keys or first name lowercase.
    const childDetails = resolvedChildren.reduce((acc: any, child) => {
      // Create a URL-friendly key from the first name, fallback to id
      const key = child.name.split(' ')[0].toLowerCase() || child.id;
      acc[key] = child;
      return acc;
    }, {});

    return {
      parentName: parentUser ? parentUser.firstName : 'Parent',
      children: childDetails
    };
  }
}
