const cron = require("node-cron");
const User = require("../models/User");
const Test = require("../models/Test");
const Fee = require("../models/Fee");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");

// Builds and saves one summary notification for every admin, covering everything
// that happened / needs attention — so the admin doesn't have to check each screen manually.
const generateDailySummary = async () => {
  try {
    const admins = await User.find({ role: "admin", status: "approved" });
    if (admins.length === 0) return;

    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [pendingApprovals, submittedYesterday, pendingFeesAgg, upcomingTests] = await Promise.all([
      User.countDocuments({ status: "pending" }),
      Submission.countDocuments({ createdAt: { $gte: since } }),
      Fee.aggregate([
        { $match: { status: { $in: ["pending", "overdue"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Test.countDocuments({ scheduledFor: { $gte: now }, status: { $in: ["scheduled", "active"] } }),
    ]);

    const pendingFees = pendingFeesAgg[0]?.total || 0;
    const pendingFeesCount = pendingFeesAgg[0]?.count || 0;

    const summaryLines = [
      `${pendingApprovals} account(s) awaiting approval`,
      `${submittedYesterday} test submission(s) in the last 24 hours`,
      `₹${pendingFees.toLocaleString("en-IN")} in pending fees across ${pendingFeesCount} student(s)`,
      `${upcomingTests} upcoming test(s) scheduled`,
    ];

    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        type: "announcement",
        title: "Daily summary",
        message: summaryLines.join(" • "),
        priority: "medium",
      }))
    );

    console.log("✅ Daily admin summary generated");
  } catch (error) {
    console.error("❌ Failed to generate daily summary:", error.message);
  }
};

// Schedules the job for 8:00 AM server time, every day.
const scheduleDailySummary = () => {
  cron.schedule("0 8 * * *", generateDailySummary);
  console.log("🕗 Daily admin summary scheduled for 8:00 AM daily");
};

module.exports = { scheduleDailySummary, generateDailySummary };
