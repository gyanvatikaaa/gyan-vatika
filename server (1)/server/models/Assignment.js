const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Files the tutor/admin shared with the assignment (PDFs, images)
    attachments: [
      {
        url: String,
        fileType: String, // "pdf" | "image"
        fileName: String,
      },
    ],

    class: { type: String }, // if set, all approved students in this class can see it
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // or specific students

    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
