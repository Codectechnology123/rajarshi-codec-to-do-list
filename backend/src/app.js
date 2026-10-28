const express = require("express");
const path = require("node:path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin(origin, callback) {
  const allowed = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
  if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== "production") return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
} }));
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "daymark-api" } }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) => req.path.startsWith("/api/") ? next() : res.sendFile(path.join(dist, "index.html")));
}
app.use(notFound);
app.use(errorHandler);
module.exports = app;
