import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin(origin, callback) {
  const allowed = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
  if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== "production") return callback(null, true);
  return callback(new Error("This origin is not allowed by CORS."));
} }));
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "daymark-api" } }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
if (process.env.NODE_ENV === "production") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const dist = path.resolve(here, "../../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) => req.path.startsWith("/api/") ? next() : res.sendFile(path.join(dist, "index.html")));
}
app.use(notFound);
app.use(errorHandler);
export default app;
