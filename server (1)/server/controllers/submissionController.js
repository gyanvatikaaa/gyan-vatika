const Test = require("../models/Test");
const Submission = require("../models/Submission");
const cloudinary = require("../config/cloudinary");

// @route  GET /api/submissions/available-tests
// @desc   Student sees tests assigned to them, or open to their whole class
const getAvailableTests = async (req, res) => {
  try {
    const student = req.user;

    const tests = await Test.find({
      status: { $in: ["scheduled", "active"] },
      class: student.studentClass,
      $or: [
        { assignedStudents: { $size: 0 } },
        { assignedStudents: student._id },
      ],
    }).select("-questions.correctAnswer"); // never leak MCQ answers to the student

    // Attach the student's own submission status for each test, if one exists
    const testIds = tests.map((t) => t._id);
    const mySubmissions = await Submission.find({ test: { $in: testIds }, student: student._id });
    const submissionByTest = Object.fromEntries(mySubmissions.map((s) => [s.test.toString(), s]));

    const result = tests.map((t) => ({
      ...t.toObject(),
      questionCount: t.questions.length,
      mySubmissionStatus: submissionByTest[t._id.toString()]?.status || null,
      mySubmissionId: submissionByTest[t._id.toString()]?._id || null,
    }));

    res.json({ tests: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to load available tests", error: error.message });
  }
};

// @route  POST /api/submissions/start/:testId
// @desc   Starts the timer — creates (or resumes) a submission record
const startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    let submission = await Submission.findOne({ test: test._id, student: req.user._id });

    if (submission && submission.status !== "in_progress") {
      return res.status(400).json({ message: "You have already submitted this test" });
    }

    if (!submission) {
      submission = await Submission.create({
        test: test._id,
        student: req.user._id,
        startedAt: new Date(),
        status: "in_progress",
      });
    }

    // Send the test WITHOUT correct answers, plus the submission (has startedAt for timer)
    const safeTest = await Test.findById(test._id).select("-questions.correctAnswer");
    res.json({ test: safeTest, submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to start test", error: error.message });
  }
};

// @route  POST /api/submissions/upload-photo
// @desc   Uploads a handwritten answer photo, returns the hosted URL
const uploadAnswerPhoto = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: "gyan-vatika/handwritten-answers",
      resource_type: "image",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Photo upload failed", error: error.message });
  }
};

// @route  POST /api/submissions/:submissionId/submit
// @desc   Final submission — records answers and time spent, locks the test
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your submission" });
    }
    if (submission.status !== "in_progress") {
      return res.status(400).json({ message: "This test has already been submitted" });
    }

    submission.answers = answers;
    submission.submittedAt = new Date();
    submission.timeSpentSeconds = Math.round((submission.submittedAt - submission.startedAt) / 1000);
    submission.status = "submitted";
    await submission.save();

    res.json({ message: "Test submitted successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit test", error: error.message });
  }
};

// @route  GET /api/submissions/mine
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("test", "title subject class")
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

// @route  GET /api/submissions/:id/result
// @desc   Student views their own result — only once fully approved
const getMyResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("test");
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your submission" });
    }

    if (submission.status !== "approved") {
      return res.status(403).json({ message: "Your result is not approved yet. Please check back soon." });
    }

    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch result", error: error.message });
  }
};

module.exports = { getAvailableTests, startTest, uploadAnswerPhoto, submitTest, getMySubmissions, getMyResult };
