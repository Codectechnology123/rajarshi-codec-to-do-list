require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and configure MongoDB.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  } catch (error) {
    console.error("Could not start API:", error.message);
    process.exit(1);
  }
}

start();
