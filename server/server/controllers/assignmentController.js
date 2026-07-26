const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Notification = require("../models/Notification");
const User = require("../models/User");

// @route  POST /api/assignments
// @desc   Admin/tutor shares an assignment with a class or specific students
const createAssignment = async (req, res) => {
  try {
    const { title, description, attachments, className, assignedStudents, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!className && !assignedStudents?.length) {
      return res.status(400).json({ message: "Select a class or specific students" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      createdBy: req.user._id,
      attachments: attachments || [],
      class: className,
      assignedStudents: assignedStudents || [],
      dueDate,
    });

    const targetStudents = assignedStudents?.length
      ? await User.find({ _id: { $in: assignedStudents } })
      : await User.find({ role: "student", status: "approved", studentClass: className });

    const recipients = [];
    targetStudents.forEach((s) => {
      recipients.push(s._id);
      if (s.parent) recipients.push(s.parent);
    });
    if (recipients.length > 0) {
      await Notification.insertMany(
        recipients.map((recipient) => ({
          recipient,
          type: "homework",
          title: "New assignment shared",
          message: `"${title}" has been shared${dueDate ? `, due ${new Date(dueDate).toLocaleDateString("en-IN")}` : ""}.`,
        }))
      );
    }

    res.status(201).json({ message: "Assignment shared", assignment });
  } catch (error) {
    res.status(500).json({ message: "Failed to create assignment", error: error.message });
  }
};

// @route  GET /api/assignments/mine-created
// @desc   Admin/tutor sees assignments they created
const getMyCreatedAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
  }
};

// @route  GET /api/assignments/available
// @desc   Student sees assignments shared with their class or them specifically
const getAvailableAssignments = async (req, res) => {
  try {
    const student = req.user;
    const assignments = await Assignment.find({
      $or: [{ class: student.studentClass }, { assignedStudents: student._id }],
    }).sort({ createdAt: -1 });

    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignments.map((a) => a._id) },
      student: student._id,
    });
    const submissionByAssignment = Object.fromEntries(submissions.map((s) => [s.assignment.toString(), s]));

    const result = assignments.map((a) => ({
      ...a.toObject(),
      mySubmission: submissionByAssignment[a._id.toString()] || null,
    }));

    res.json({ assignments: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
  }
};

// @route  POST /api/assignments/:id/submit
// @desc   Student submits their response files
const submitAssignment = async (req, res) => {
  try {
    const { files } = req.body;
    if (!files?.length) return res.status(400).json({ message: "At least one file is required" });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    let submission = await AssignmentSubmission.findOne({ assignment: assignment._id, student: req.user._id });
    if (submission) {
      submission.files = files;
      submission.submittedAt = new Date();
      submission.status = "submitted";
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignment: assignment._id,
        student: req.user._id,
        files,
      });
    }

    res.status(201).json({ message: "Assignment submitted", submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit assignment", error: error.message });
  }
};

// @route  GET /api/assignments/:id/submissions
// @desc   Admin/tutor views all submissions for one assignment
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate("student", "name studentClass phone")
      .sort({ submittedAt: -1 });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

module.exports = {
  createAssignment,
  getMyCreatedAssignments,
  getAvailableAssignments,
  submitAssignment,
  getSubmissionsForAssignment,
};
