const User = require("../models/User");
const Notification = require("../models/Notification");

// @route  GET /api/admin/users?status=pending&role=student
// @desc   Admin views all users, filterable by status/role
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @route  PATCH /api/admin/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    // NOTE: notification hook goes here in Chunk 9 (email + WhatsApp alert to user)
    await Notification.create({
      recipient: user._id,
      type: "account_approved",
      title: "Your account has been approved",
      message: "You can now log in and start using Gyan Vatika.",
    });

    res.json({ message: `${user.name} has been approved and can now log in`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve user", error: error.message });
  }
};

// @route  PATCH /api/admin/users/:id/deactivate
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot deactivate an admin account" });
    }

    user.status = "deactivated";
    user.deactivatedBy = req.user._id;
    user.deactivatedAt = new Date();
    await user.save();

    await Notification.create({
      recipient: user._id,
      type: "account_deactivated",
      title: "Your account has been deactivated",
      message: "Please contact the admin if you believe this is a mistake.",
      priority: "high",
    });

    res.json({ message: `${user.name}'s account has been deactivated`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate user", error: error.message });
  }
};

// @route  PATCH /api/admin/users/:id/reactivate
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    user.deactivatedBy = undefined;
    user.deactivatedAt = undefined;
    await user.save();

    res.json({ message: `${user.name}'s account has been reactivated`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to reactivate user", error: error.message });
  }
};

module.exports = { getUsers, approveUser, deactivateUser, reactivateUser };
