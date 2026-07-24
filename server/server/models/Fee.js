const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g. "July 2026"
    status: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
    dueDate: { type: Date },
    paidOn: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
