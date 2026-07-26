const Submission = require("../models/Submission");
const Test = require("../models/Test");
const Notification = require("../models/Notification");
const { evaluateAnswer } = require("../services/geminiService");

// @route  GET /api/review/pending
// @desc   Admin/tutor sees submissions waiting for checking or approval
const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: { $in: ["submitted", "ai_checked"] } })
      .populate("student", "name email studentClass")
      .populate("test", "title subject class durationMinutes")
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending submissions", error: error.message });
  }
};

// @route  GET /api/review/:id
const getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email studentClass")
      .populate("test");
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submission", error: error.message });
  }
};

// @route  POST /api/review/:id/ai-check
// @desc   Runs AI grading: MCQs auto-checked instantly, short/long answers evaluated by Gemini
// (using vision if a handwritten photo was uploaded, otherwise typed text).
const runAICheck = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const test = await Test.findById(submission.test);
    if (!test) return res.status(404).json({ message: "Original test not found" });

    const gradedAnswers = [];
    for (const answer of submission.answers) {
      const question = test.questions[answer.questionIndex];
      if (!question) {
        gradedAnswers.push(answer);
        continue;
      }

      if (question.type === "mcq") {
        const isCorrect = answer.textAnswer?.trim() === question.correctAnswer?.trim();
        gradedAnswers.push({
          ...answer.toObject(),
          marksAwarded: isCorrect ? question.maxMarks : 0,
          aiRemark: isCorrect ? "Correct." : `Incorrect. The correct answer was: ${question.correctAnswer}`,
        });
      } else {
        try {
          const { marksAwarded, remark } = await evaluateAnswer({
            questionText: question.questionText,
            maxMarks: question.maxMarks,
            textAnswer: answer.textAnswer,
            photoUrls: answer.photoUrls,
          });
          gradedAnswers.push({ ...answer.toObject(), marksAwarded, aiRemark: remark });
        } catch (err) {
          console.error(`AI grading failed for question ${answer.questionIndex}:`, err.message);
          gradedAnswers.push({
            ...answer.toObject(),
            marksAwarded: 0,
            aiRemark: "AI could not evaluate this answer automatically — needs manual review.",
          });
        }
      }
    }

    const totalMarksAwarded = gradedAnswers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
    const totalPossible = test.questions.reduce((sum, q) => sum + q.maxMarks, 0);

    submission.answers = gradedAnswers;
    submission.totalMarksAwarded = totalMarksAwarded;
    submission.aiSummary = `Scored ${totalMarksAwarded} out of ${totalPossible} (${Math.round(
      (totalMarksAwarded / totalPossible) * 100
    )}%). Review each question's remark below for details on mistakes and improvements.`;
    submission.status = "ai_checked";
    await submission.save();

    // Flag the admin overview if performance is low
    if (totalMarksAwarded / totalPossible < 0.4) {
      await Notification.create({
        recipient: req.user._id,
        type: "low_performance",
        title: "Low test performance detected",
        message: `A student scored ${Math.round((totalMarksAwarded / totalPossible) * 100)}% on "${test.title}" — may need extra attention.`,
        isAiAlert: true,
        priority: "high",
        relatedStudent: submission.student,
      });
    }

    res.json({ message: "AI check complete", submission });
  } catch (error) {
    console.error("=== AI CHECK ERROR ===", error);
    res.status(500).json({ message: "AI checking failed", error: error.message });
  }
};

// @route  PATCH /api/review/:id/approve
// @desc   Tutor and Admin each approve independently. Once BOTH have approved,
// the result becomes visible to the student and parent.
const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.status !== "ai_checked" && submission.status !== "approved") {
      return res.status(400).json({ message: "This submission must be AI-checked before it can be approved" });
    }

    if (req.user.role === "tutor") submission.approvedByTutor = true;
    if (req.user.role === "admin") submission.approvedByAdmin = true;

    if (submission.approvedByTutor && submission.approvedByAdmin) {
      submission.status = "approved";

      await Notification.create({
        recipient: submission.student,
        type: "test_result",
        title: "Your test result is ready",
        message: `Your test has been checked and approved. You scored ${submission.totalMarksAwarded} marks.`,
      });
    }

    await submission.save();
    res.json({ message: "Approval recorded", submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve submission", error: error.message });
  }
};

// @route  PATCH /api/review/:id/answer/:questionIndex
// @desc   Tutor/admin manually override the AI's marks/remark for one answer
const updateAnswerMarks = async (req, res) => {
  try {
    const { marksAwarded, remark } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const qIndex = Number(req.params.questionIndex);
    const answer = submission.answers.find((a) => a.questionIndex === qIndex);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    if (marksAwarded !== undefined) answer.marksAwarded = marksAwarded;
    if (remark !== undefined) answer.aiRemark = remark;

    submission.totalMarksAwarded = submission.answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
    await submission.save();

    res.json({ message: "Marks updated", submission });
  } catch (error) {
    res.status(500).json({ message: "Failed to update marks", error: error.message });
  }
};

module.exports = { getPendingSubmissions, getSubmissionDetail, runAICheck, approveSubmission, updateAnswerMarks };
