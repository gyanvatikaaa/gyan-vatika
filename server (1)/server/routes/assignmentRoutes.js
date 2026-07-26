const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getMyCreatedAssignments,
  getAvailableAssignments,
  submitAssignment,
  getSubmissionsForAssignment,
} = require("../controllers/assignmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", authorizeRoles("admin", "tutor"), createAssignment);
router.get("/mine-created", authorizeRoles("admin", "tutor"), getMyCreatedAssignments);
router.get("/:id/submissions", authorizeRoles("admin", "tutor"), getSubmissionsForAssignment);

router.get("/available", authorizeRoles("student"), getAvailableAssignments);
router.post("/:id/submit", authorizeRoles("student"), submitAssignment);

module.exports = router;
