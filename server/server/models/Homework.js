const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ["assigned", "submitted", "completed"], default: "assigned" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homework", homeworkSchema);
