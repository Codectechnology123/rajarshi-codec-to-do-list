require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const port = Number(process.env.PORT) || 5000;
async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Add it to backend/.env before starting the server.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be a random string of at least 32 characters.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  app.listen(port, "0.0.0.0", () => console.log(`Daymark API listening on port ${port}`));
}
start().catch(error => { console.error("Server startup failed:", error.message); process.exit(1); });
