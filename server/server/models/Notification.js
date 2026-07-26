const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "test_upcoming",
        "test_result",
        "homework",
        "attendance",
        "fee_reminder",
        "announcement",
        "low_performance", // AI alert
        "account_approved",
        "account_deactivated",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },

    // Marks this as something the admin overview should surface prominently
    isAiAlert: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },

    relatedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
