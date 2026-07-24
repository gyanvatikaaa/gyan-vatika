const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    timeSpentSeconds: { type: Number },

    answers: [
      {
        questionIndex: { type: Number, required: true },
        type: { type: String, enum: ["mcq", "short", "long"], required: true },
        // MCQ: typed answer text. Short/long: either typed text OR a photo of handwriting.
        textAnswer: { type: String },
        photoUrl: { type: String },
        // Filled in once AI/tutor/admin checks it
        marksAwarded: { type: Number },
        aiRemark: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ["in_progress", "submitted", "ai_checked", "approved"],
      default: "in_progress",
    },

    totalMarksAwarded: { type: Number },
    aiSummary: { type: String },
    approvedByTutor: { type: Boolean, default: false },
    approvedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
