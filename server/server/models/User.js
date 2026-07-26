const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "tutor", "parent", "student"],
      required: true,
    },

    // Account lifecycle: pending -> approved, or approved -> deactivated
    status: {
      type: String,
      enum: ["pending", "approved", "deactivated"],
      default: "pending",
    },

    // ---- Role-specific fields ----
    // Student
    studentClass: { type: String }, // e.g. "10th"
    subjects: [{ type: String }],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Tutor
    tutorSubjects: [{ type: String }],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Parent
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Who approved/deactivated this account, for audit trail
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deactivatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
