const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Homework = require("../models/Homework");
const Notification = require("../models/Notification");

// @route  GET /api/tutor/students
const getMyStudents = async (req, res) => {
  try {
    const tutor = await User.findById(req.user._id).populate(
      "assignedStudents",
      "name email phone studentClass"
    );
    res.json({ students: tutor.assignedStudents });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

// @route  POST /api/tutor/attendance
// @body   { studentId, date, status, remarks }
const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, remarks } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ message: "Student, date, and status are required" });
    }

    const record = await Attendance.create({
      student: studentId,
      tutor: req.user._id,
      date,
      status,
      remarks,
    });

    const student = await User.findById(studentId);
    const recipients = [studentId, ...(student?.parent ? [student.parent] : [])];
    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient,
        type: "attendance",
        title: "Attendance updated",
        message: `Marked ${status} for ${new Date(date).toLocaleDateString("en-IN")}${remarks ? `. Remark: ${remarks}` : ""}`,
      }))
    );

    res.status(201).json({ message: "Attendance recorded", record });
  } catch (error) {
    res.status(500).json({ message: "Failed to record attendance", error: error.message });
  }
};

// @route  GET /api/tutor/attendance/:studentId
const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
};

// @route  POST /api/tutor/homework
// @body   { studentId, title, description, dueDate }
const addHomework = async (req, res) => {
  try {
    const { studentId, title, description, dueDate } = req.body;
    if (!studentId || !title) {
      return res.status(400).json({ message: "Student and title are required" });
    }

    const homework = await Homework.create({
      tutor: req.user._id,
      student: studentId,
      title,
      description,
      dueDate,
    });

    const student = await User.findById(studentId);
    const recipients = [studentId, ...(student?.parent ? [student.parent] : [])];
    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient,
        type: "homework",
        title: "New homework assigned",
        message: `"${title}" has been assigned${dueDate ? `, due ${new Date(dueDate).toLocaleDateString("en-IN")}` : ""}.`,
      }))
    );

    res.status(201).json({ message: "Homework assigned", homework });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign homework", error: error.message });
  }
};

// @route  GET /api/tutor/homework/:studentId
const getStudentHomework = async (req, res) => {
  try {
    const homework = await Homework.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json({ homework });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch homework", error: error.message });
  }
};

// @route  PATCH /api/tutor/homework/:id/status
const updateHomeworkStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ message: "Homework not found" });
    homework.status = status;
    await homework.save();
    res.json({ message: "Homework status updated", homework });
  } catch (error) {
    res.status(500).json({ message: "Failed to update homework", error: error.message });
  }
};

module.exports = {
  getMyStudents,
  markAttendance,
  getStudentAttendance,
  addHomework,
  getStudentHomework,
  updateHomeworkStatus,
};
