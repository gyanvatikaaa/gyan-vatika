const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String, required: true },
    subject: { type: String, required: true },
    chapters: [{ type: String }],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Filled in Chunk 4 when AI generation is wired up
    questions: [
      {
        type: { type: String, enum: ["mcq", "short", "long"] },
        questionText: String,
        options: [String], // for MCQ
        correctAnswer: String, // for MCQ auto-check
        maxMarks: Number,
      },
    ],

    durationMinutes: { type: Number, default: 30 },
    scheduledFor: { type: Date },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
