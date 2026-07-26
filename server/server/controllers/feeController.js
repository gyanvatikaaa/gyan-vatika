const Fee = require("../models/Fee");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @route  POST /api/admin/fees
// @body   { studentId, amount, month, dueDate }
const createFee = async (req, res) => {
  try {
    const { studentId, amount, month, dueDate } = req.body;
    if (!studentId || !amount || !month) {
      return res.status(400).json({ message: "Student, amount, and month are required" });
    }
    const fee = await Fee.create({ student: studentId, amount, month, dueDate, status: "pending" });

    const student = await User.findById(studentId);
    const recipients = [studentId, ...(student?.parent ? [student.parent] : [])];
    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient,
        type: "fee_reminder",
        title: "Fee due",
        message: `₹${amount.toLocaleString("en-IN")} due for ${month}${dueDate ? ` by ${new Date(dueDate).toLocaleDateString("en-IN")}` : ""}.`,
      }))
    );

    res.status(201).json({ message: "Fee record created", fee });
  } catch (error) {
    res.status(500).json({ message: "Failed to create fee record", error: error.message });
  }
};

// @route  PATCH /api/admin/fees/:id
// @body   { status }
const updateFeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    fee.status = status;
    if (status === "paid") fee.paidOn = new Date();
    await fee.save();
    res.json({ message: "Fee status updated", fee });
  } catch (error) {
    res.status(500).json({ message: "Failed to update fee", error: error.message });
  }
};

// @route  GET /api/admin/fees
// @desc   All fee records, most recent first — for the admin fees screen
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate("student", "name studentClass phone").sort({ createdAt: -1 });
    res.json({ fees });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fees", error: error.message });
  }
};

// Permission check reused from records pattern
const canAccessStudent = async (requester, studentId) => {
  if (requester.role === "admin" || requester.role === "tutor") return true;
  if (requester.role === "student") return requester._id.toString() === studentId;
  if (requester.role === "parent") {
    const parent = await User.findById(requester._id);
    return parent.children.some((c) => c.toString() === studentId);
  }
  return false;
};

// @route  GET /api/records/fees/:studentId
const getFeesForStudent = async (req, res) => {
  try {
    const allowed = await canAccessStudent(req.user, req.params.studentId);
    if (!allowed) return res.status(403).json({ message: "Not authorized to view these fee records" });

    const fees = await Fee.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json({ fees });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fees", error: error.message });
  }
};

module.exports = { createFee, updateFeeStatus, getAllFees, getFeesForStudent };
