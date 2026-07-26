const express = require("express");
const router = express.Router();
const { getMyProgress, getStudentProgress } = require("../controllers/progressController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/me", authorizeRoles("student"), getMyProgress);

// Admin/tutor can view any student. Parents can only view their own linked children.
router.get("/student/:studentId", authorizeRoles("admin", "tutor", "parent"), async (req, res, next) => {
  if (req.user.role === "parent") {
    const isMyChild = req.user.children?.some((childId) => childId.toString() === req.params.studentId);
    if (!isMyChild) {
      return res.status(403).json({ message: "You can only view your own child's progress" });
    }
  }
  next();
}, getStudentProgress);

module.exports = router;
