const express = require("express");
const router = express.Router();
const {
  getPendingSubmissions,
  getSubmissionDetail,
  runAICheck,
  approveSubmission,
  updateAnswerMarks,
} = require("../controllers/reviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("admin", "tutor"));

router.get("/pending", getPendingSubmissions);
router.get("/:id", getSubmissionDetail);
router.post("/:id/ai-check", runAICheck);
router.patch("/:id/approve", approveSubmission);
router.patch("/:id/answer/:questionIndex", updateAnswerMarks);

module.exports = router;
