import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestLogger } from "./middleware/logging.js";
import { sendResponse } from "./utils/response.js";

function resolveCorsOrigin(): string | string[] | boolean {
  if (env.CORS_ORIGIN === "*") {
    return true;
  }

  return env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
}

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: resolveCorsOrigin(),
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/", (_req, res) => {
  sendResponse(res, 200, "School Management ERP API", {
    status: "ok",
    apiVersion: "v1",
    healthCheck: "/healthz",
    documentation: "/api/v1",
  });
});

app.get("/healthz", (_req, res) => {
  sendResponse(res, 200, "Service is running", {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(2)),
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);