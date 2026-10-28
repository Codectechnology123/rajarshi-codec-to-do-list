const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Pending", "In-Progress", "Completed"], default: "Pending", index: true },
  dueDate: { type: Date, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
}, { timestamps: true });

taskSchema.index({ owner: 1, createdAt: -1 });
module.exports = mongoose.model("Task", taskSchema);
