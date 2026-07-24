const Submission = require("../models/Submission");
const Test = require("../models/Test");

// Builds the full progress picture for one student from their approved submissions.
const buildProgressReport = async (studentId) => {
  const submissions = await Submission.find({ student: studentId, status: "approved" })
    .populate("test", "title subject chapters class questions")
    .sort({ submittedAt: 1 });

  if (submissions.length === 0) {
    return {
      overall: { testsCompleted: 0, averagePercent: 0 },
      subjectWise: [],
      monthlyTrend: [],
      weakTopics: [],
      strongTopics: [],
      testHistory: [],
    };
  }

  const withPercent = submissions.map((s) => {
    const totalPossible = s.test.questions.reduce((sum, q) => sum + q.maxMarks, 0) || 1;
    const percent = Math.round((s.totalMarksAwarded / totalPossible) * 100);
    return { submission: s, percent, totalPossible };
  });

  // Overall
  const averagePercent = Math.round(
    withPercent.reduce((sum, w) => sum + w.percent, 0) / withPercent.length
  );

  // Subject-wise averages
  const subjectMap = {};
  withPercent.forEach(({ submission, percent }) => {
    const subject = submission.test.subject;
    if (!subjectMap[subject]) subjectMap[subject] = [];
    subjectMap[subject].push(percent);
  });
  const subjectWise = Object.entries(subjectMap).map(([subject, percents]) => ({
    subject,
    averagePercent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
    testsCount: percents.length,
  }));

  // Monthly trend
  const monthMap = {};
  withPercent.forEach(({ submission, percent }) => {
    const date = submission.submittedAt || submission.createdAt;
    const key = date.toLocaleString("en-IN", { month: "short", year: "numeric" });
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(percent);
  });
  const monthlyTrend = Object.entries(monthMap).map(([month, percents]) => ({
    month,
    averagePercent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
  }));

  // Weak / strong topics (chapter-level), based on score in tests covering that chapter
  const chapterMap = {};
  withPercent.forEach(({ submission, percent }) => {
    (submission.test.chapters || []).forEach((chapter) => {
      if (!chapterMap[chapter]) chapterMap[chapter] = [];
      chapterMap[chapter].push(percent);
    });
  });
  const chapterAverages = Object.entries(chapterMap).map(([chapter, percents]) => ({
    chapter,
    averagePercent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
  }));
  const weakTopics = chapterAverages.filter((c) => c.averagePercent < 50).sort((a, b) => a.averagePercent - b.averagePercent);
  const strongTopics = chapterAverages.filter((c) => c.averagePercent >= 75).sort((a, b) => b.averagePercent - a.averagePercent);

  const testHistory = withPercent.map(({ submission, percent }) => ({
    testTitle: submission.test.title,
    subject: submission.test.subject,
    percent,
    marksAwarded: submission.totalMarksAwarded,
    submittedAt: submission.submittedAt,
    timeSpentSeconds: submission.timeSpentSeconds,
  }));

  return {
    overall: { testsCompleted: submissions.length, averagePercent },
    subjectWise,
    monthlyTrend,
    weakTopics,
    strongTopics,
    testHistory,
  };
};

// @route  GET /api/progress/me
// @desc   Student views their own progress
const getMyProgress = async (req, res) => {
  try {
    const report = await buildProgressReport(req.user._id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to build progress report", error: error.message });
  }
};

// @route  GET /api/progress/student/:studentId
// @desc   Admin/tutor/parent views a specific student's progress
const getStudentProgress = async (req, res) => {
  try {
    const report = await buildProgressReport(req.params.studentId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to build progress report", error: error.message });
  }
};

module.exports = { getMyProgress, getStudentProgress };
