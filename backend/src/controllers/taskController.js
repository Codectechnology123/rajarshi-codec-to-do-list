const mongoose = require("mongoose");
const Task = require("../models/Task");

const allowedStatuses = ["Pending", "In-Progress", "Completed"];
const allowedSorts = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, dueDate: { dueDate: 1, createdAt: -1 }, title: { title: 1 }, status: { status: 1, createdAt: -1 } };

function validateTask(body, partial = false) {
  const details = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length < 2 || body.title.trim().length > 120) details.push({ field: "title", message: "Title must be 2–120 characters." });
  }
  if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 1000)) details.push({ field: "description", message: "Description must be at most 1000 characters." });
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) details.push({ field: "status", message: "Choose Pending, In-Progress, or Completed." });
  if (body.dueDate !== undefined && body.dueDate !== null && body.dueDate !== "" && Number.isNaN(Date.parse(body.dueDate))) details.push({ field: "dueDate", message: "Enter a valid due date." });
  return details;
}

async function listTasks(req, res, next) {
  try {
    const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(50, Number.parseInt(req.query.limit, 10) || 8));
    const filter = { owner: req.user._id };
    if (req.query.status && req.query.status !== "All") {
      if (!allowedStatuses.includes(req.query.status)) return res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Unknown task status." } });
      filter.status = req.query.status;
    }
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const safeSearch = req.query.search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: { $regex: safeSearch, $options: "i" } }, { description: { $regex: safeSearch, $options: "i" } }];
    }
    const sort = allowedSorts[req.query.sort] || allowedSorts.newest;
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Task.countDocuments(filter)
    ]);
    res.json({ success: true, data: { tasks, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } } });
  } catch (error) { next(error); }
}

async function createTask(req, res, next) {
  try {
    const details = validateTask(req.body);
    if (details.length) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details } });
    const task = await Task.create({
      title: req.body.title.trim(),
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
      status: req.body.status || "Pending",
      dueDate: req.body.dueDate || null,
      owner: req.user._id
    });
    res.status(201).json({ success: true, data: { task } });
  } catch (error) { next(error); }
}

async function updateTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "The task ID is not valid." } });
    const details = validateTask(req.body, true);
    if (details.length) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details } });
    const updates = {};
    for (const key of ["title", "description", "status", "dueDate"]) {
      if (req.body[key] !== undefined) updates[key] = key === "title" || key === "description" ? req.body[key].trim() : (key === "dueDate" && req.body[key] === "" ? null : req.body[key]);
    }
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, error: { code: "TASK_NOT_FOUND", message: "Task not found." } });
    res.json({ success: true, data: { task } });
  } catch (error) { next(error); }
}

async function deleteTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "The task ID is not valid." } });
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: { code: "TASK_NOT_FOUND", message: "Task not found." } });
    res.json({ success: true, data: { id: task._id, message: "Task deleted." } });
  } catch (error) { next(error); }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
