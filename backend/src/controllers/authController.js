const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function issueToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const error = new Error("JWT_SECRET must be configured with at least 32 characters.");
    error.status = 500;
    throw error;
  }
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function register(req, res, next) {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const details = [];
    if (name.length < 2 || name.length > 60) details.push({ field: "name", message: "Name must be 2–60 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) details.push({ field: "email", message: "Enter a valid email address." });
    if (password.length < 8 || password.length > 72) details.push({ field: "password", message: "Password must be 8–72 characters." });
    if (details.length) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details } });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." } });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    return res.status(201).json({ success: true, data: { user: publicUser(user), token: issueToken(user) } });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Email and password are required." } });
    const user = await User.findOne({ email }).select("+password");
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } });
    return res.json({ success: true, data: { user: publicUser(user), token: issueToken(user) } });
  } catch (error) { next(error); }
}

async function me(req, res) {
  res.json({ success: true, data: { user: publicUser(req.user) } });
}

module.exports = { register, login, me };
