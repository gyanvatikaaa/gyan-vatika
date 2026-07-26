const express = require("express");
const router = express.Router();
const {
  getMyStudents,
  markAttendance,
  getStudentAttendance,
  addHomework,
  getStudentHomework,
  updateHomeworkStatus,
} = require("../controllers/tutorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("tutor"));

router.get("/students", getMyStudents);
router.post("/attendance", markAttendance);
router.get("/attendance/:studentId", getStudentAttendance);
router.post("/homework", addHomework);
router.get("/homework/:studentId", getStudentHomework);
router.patch("/homework/:id/status", updateHomeworkStatus);

module.exports = router;
