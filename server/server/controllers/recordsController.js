const Attendance = require("../models/Attendance");
const Homework = require("../models/Homework");
const User = require("../models/User");

// Confirms the requester is allowed to view this student's records:
// the student themself, their linked parent, or any admin/tutor.
const canAccessStudent = async (requester, studentId) => {
  if (requester.role === "admin" || requester.role === "tutor") return true;
  if (requester.role === "student") return requester._id.toString() === studentId;
  if (requester.role === "parent") {
    const parent = await User.findById(requester._id);
    return parent.children.some((c) => c.toString() === studentId);
  }
  return false;
};

// @route  GET /api/records/attendance/:studentId
const getAttendance = async (req, res) => {
  try {
    const allowed = await canAccessStudent(req.user, req.params.studentId);
    if (!allowed) return res.status(403).json({ message: "Not authorized to view this student's records" });

    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
};

// @route  GET /api/records/homework/:studentId
const getHomework = async (req, res) => {
  try {
    const allowed = await canAccessStudent(req.user, req.params.studentId);
    if (!allowed) return res.status(403).json({ message: "Not authorized to view this student's records" });

    const homework = await Homework.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json({ homework });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch homework", error: error.message });
  }
};

module.exports = { getAttendance, getHomework };
