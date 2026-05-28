import { Router } from "express";
import { healthCheck } from "../../controllers/health.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(healthCheck));