import { createServer } from "node:http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";
import { scheduleJobs } from "./jobs/index.js";

const server = createServer(app);

initializeSocket(server);
scheduleJobs();

export async function startServer(): Promise<void> {
  try {
    await mongoose.connect(env.DATABASE_URL);

    server.listen(env.PORT, () => {
      console.log(`School Management ERP API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exitCode = 1;
  }
}

void startServer();

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  server.close(() => {
    process.exit(0);
  });
});