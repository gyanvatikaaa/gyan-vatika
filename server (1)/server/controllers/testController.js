const Test = require("../models/Test");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { generateTestWithAI } = require("../services/geminiService");

// @route  POST /api/tests/generate-ai
// @desc   Admin picks class/subject/chapters/difficulty, Gemini builds the full test
const generateAITest = async (req, res) => {
  try {
    const { className, subject, chapters, difficulty, mcqCount, shortCount, longCount, durationMinutes } = req.body;

    if (!className || !subject || !chapters?.length || !difficulty) {
      return res.status(400).json({ message: "Class, subject, chapters, and difficulty are required" });
    }

    const aiResult = await generateTestWithAI({
      className,
      subject,
      chapters,
      difficulty,
      mcqCount: mcqCount ?? 5,
      shortCount: shortCount ?? 3,
      longCount: longCount ?? 2,
    });
    const test = await Test.create({
      title: aiResult.title,
      class: className,
      subject,
      chapters,
      difficulty,
      createdBy: req.user._id,
      questions: aiResult.questions,
      durationMinutes: durationMinutes || 30,
      status: "draft",
    });

    res.status(201).json({ message: "AI generated the test successfully", test });
  } catch (error) {
    console.error("=== AI TEST GENERATION ERROR ===");
    console.error(error);
    res.status(500).json({ message: "AI test generation failed", error: error.message });
  }
};

// @route  POST /api/tests/manual
// @desc   Admin/tutor writes their own questions directly, no AI involved
const createManualTest = async (req, res) => {
  try {
    const { title, className, subject, chapters, difficulty, questions, durationMinutes } = req.body;

    if (!title || !className || !subject || !questions?.length) {
      return res.status(400).json({ message: "Title, class, subject, and at least one question are required" });
    }

    const test = await Test.create({
      title,
      class: className,
      subject,
      chapters: chapters || [],
      difficulty: difficulty || "medium",
      createdBy: req.user._id,
      questions,
      durationMinutes: durationMinutes || 30,
      status: "draft",
    });

    res.status(201).json({ message: "Test created successfully", test });
  } catch (error) {
    res.status(500).json({ message: "Failed to create test", error: error.message });
  }
};

// @route  GET /api/tests
const getTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tests", error: error.message });
  }
};

// @route  GET /api/tests/:id
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ test });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch test", error: error.message });
  }
};

// @route  PATCH /api/tests/:id/publish
// @desc   Moves a draft test to "scheduled" so it becomes visible to assigned students
const publishTest = async (req, res) => {
  try {
    const { scheduledFor, durationMinutes, assignedStudents } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.status = "scheduled";
    if (scheduledFor) test.scheduledFor = scheduledFor;
    if (durationMinutes) test.durationMinutes = durationMinutes;
    if (assignedStudents) test.assignedStudents = assignedStudents;
    await test.save();

    const targetStudents = assignedStudents?.length
      ? await User.find({ _id: { $in: assignedStudents } })
      : await User.find({ role: "student", status: "approved", studentClass: test.class });

    const recipients = [];
    targetStudents.forEach((s) => {
      recipients.push(s._id);
      if (s.parent) recipients.push(s.parent);
    });
    if (recipients.length > 0) {
      await Notification.insertMany(
        recipients.map((recipient) => ({
          recipient,
          type: "test_upcoming",
          title: "New test available",
          message: `"${test.title}" (${test.subject}) is now available to take.`,
        }))
      );
    }

    res.json({ message: "Test published", test });
  } catch (error) {
    res.status(500).json({ message: "Failed to publish test", error: error.message });
  }
};

// @route  PATCH /api/tests/:id
// @desc   Edit a test's questions/details — used to tweak AI-generated tests
const updateTest = async (req, res) => {
  try {
    const { title, questions, durationMinutes } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    if (title !== undefined) test.title = title;
    if (questions !== undefined) test.questions = questions;
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes;
    await test.save();

    res.json({ message: "Test updated", test });
  } catch (error) {
    res.status(500).json({ message: "Failed to update test", error: error.message });
  }
};

module.exports = { generateAITest, createManualTest, getTests, getTestById, publishTest, updateTest };
