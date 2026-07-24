const express = require("express");
const router = express.Router();
const {
  getAvailableTests,
  startTest,
  uploadAnswerPhoto,
  submitTest,
  getMySubmissions,
  getMyResult,
} = require("../controllers/submissionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("student"));

router.get("/available-tests", getAvailableTests);
router.get("/mine", getMySubmissions);
router.get("/:id/result", getMyResult);
router.post("/start/:testId", startTest);
router.post("/upload-photo", uploadAnswerPhoto);
router.post("/:submissionId/submit", submitTest);

module.exports = router;
