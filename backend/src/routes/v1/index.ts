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

export const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/schools", schoolRouter);
v1Router.use("/students", studentRouter);
v1Router.use("/employees", employeeRouter);
v1Router.use("/attendance-reports", attendanceRouter);
v1Router.use("/fees", feeRouter);
v1Router.use("/exams", examRouter);
v1Router.use("/homework", homeworkRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/chat", chatRouter);