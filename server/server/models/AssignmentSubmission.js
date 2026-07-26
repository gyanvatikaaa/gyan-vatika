const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    files: [
      {
        url: String,
        fileType: String, // "pdf" | "image"
        fileName: String,
      },
    ],

    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["submitted", "reviewed"], default: "submitted" },
    tutorRemark: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
