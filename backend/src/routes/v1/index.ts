import { Router } from "express";
import { authRoutes as authRouter } from "./auth.routes.js";
import { healthRoutes as healthRouter } from "./health.routes.js";
import { schoolRouter } from "./school.routes.js";
import { studentRouter } from "./student.routes.js";
import { employeeRouter } from "./employee.routes.js";
import { attendanceRouter } from "./attendance.routes.js";
import { feeRouter } from "./fee.routes.js";
import { examRouter } from "./exam.routes.js";
import { homeworkRouter } from "./homework.routes.js";
import { notificationRouter } from "./notification.routes.js";
import { chatRouter } from "./chat.routes.js";
import { academicsRouter } from "./academics.routes.js";
import { hostelRouter } from "./hostel.routes.js";
import { transportRouter } from "./transport.routes.js";
import { libraryRouter } from "./library.routes.js";
import { hrRouter } from "./hr.routes.js";
import { userRouter } from "./user.routes.js";
import { inventoryRoutes as inventoryRouter } from "./inventory.routes.js";
import { eventsRoutes as eventsRouter } from "./events.routes.js";
import { admissionsRoutes as admissionsRouter } from "./admissions.routes.js";
import { visitorsRoutes as visitorsRouter } from "./visitors.routes.js";
import { analyticsRouter } from "./analytics.routes.js";
import { syllabusRouter } from "./syllabus.routes.js";
import { sportsRouter } from "./sports.routes.js";
import { parentRouter } from "./parent.routes.js";
import { HRController } from "../../controllers/hr.controller.js";
import { authenticateToken } from "../../middleware/auth.js";

export const v1Router = Router();

const leaveRouter = Router();
leaveRouter.use(authenticateToken);
leaveRouter.get("/my", (req, res, next) => {
  req.query.staffId = req.user?.id;
  return HRController.getLeaveRequests(req, res, next);
});
leaveRouter.post("/", HRController.createLeaveRequest);
leaveRouter.get("/", HRController.getLeaveRequests);
leaveRouter.patch("/:id", HRController.updateLeaveStatus);

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/schools", schoolRouter);
v1Router.use("/students", studentRouter);
v1Router.use("/employees", employeeRouter);

// Attendance routes are registered on both /attendance-reports (original) and /attendance (new compatible)
v1Router.use("/attendance-reports", attendanceRouter);
v1Router.use("/attendance", attendanceRouter);

v1Router.use("/fees", feeRouter);
v1Router.use("/exams", examRouter);
v1Router.use("/homework", homeworkRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/chat", chatRouter);

// New frontend-compatible routes
v1Router.use("/academics", academicsRouter);
v1Router.use("/hostel", hostelRouter);
v1Router.use("/transport", transportRouter);
v1Router.use("/library", libraryRouter);
v1Router.use("/hr", hrRouter);
v1Router.use("/users", userRouter);
v1Router.use("/inventory", inventoryRouter);
v1Router.use("/events", eventsRouter);
v1Router.use("/admissions", admissionsRouter);
v1Router.use("/visitors", visitorsRouter);
v1Router.use("/analytics", analyticsRouter);
v1Router.use("/leaves", leaveRouter);
v1Router.use("/syllabus", syllabusRouter);
v1Router.use("/sports", sportsRouter);
v1Router.use("/parents", parentRouter);