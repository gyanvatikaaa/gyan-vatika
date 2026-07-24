const User = require("../models/User");
const Test = require("../models/Test");
const Fee = require("../models/Fee");
const Notification = require("../models/Notification");

// @route  GET /api/admin/dashboard
// @desc   One-call summary for the admin overview screen.
// Always ordered so the most important things surface first.
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalStudents,
      totalTutors,
      activeParents,
      upcomingTests,
      pendingFeesAgg,
      recentNotifications,
      aiAlerts,
      studentsNeedingAttention,
    ] = await Promise.all([
      User.countDocuments({ role: "student", status: "approved" }),
      User.countDocuments({ role: "tutor", status: "approved" }),
      User.countDocuments({ role: "parent", status: "approved" }),
      Test.countDocuments({ scheduledFor: { $gte: now }, status: { $in: ["scheduled", "active"] } }),
      Fee.aggregate([
        { $match: { status: { $in: ["pending", "overdue"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Notification.find({ recipient: req.user._id })
        .sort({ priority: -1, createdAt: -1 })
        .limit(8),
      Notification.find({ isAiAlert: true })
        .sort({ priority: -1, createdAt: -1 })
        .limit(5)
        .populate("relatedStudent", "name"),
      // Placeholder logic until Chunk 5 (AI performance analysis) generates this properly:
      // for now, surfaces students with 2+ unread low_performance alerts
      Notification.aggregate([
        { $match: { type: "low_performance" } },
        { $group: { _id: "$relatedStudent", count: { $sum: 1 } } },
        { $match: { count: { $gte: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        { $project: { name: "$student.name", alertCount: "$count" } },
      ]),
    ]);

    res.json({
      totals: {
        students: totalStudents,
        tutors: totalTutors,
        activeParents,
        upcomingTests,
        pendingFees: pendingFeesAgg[0]?.total || 0,
        pendingFeesCount: pendingFeesAgg[0]?.count || 0,
      },
      notifications: recentNotifications,
      aiAlerts,
      studentsNeedingAttention,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard stats", error: error.message });
  }
};

module.exports = { getDashboardStats };
