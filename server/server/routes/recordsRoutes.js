const express = require("express");
const router = express.Router();
const { getAttendance, getHomework } = require("../controllers/recordsController");
const { getFeesForStudent } = require("../controllers/feeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/attendance/:studentId", getAttendance);
router.get("/homework/:studentId", getHomework);
router.get("/fees/:studentId", getFeesForStudent);

module.exports = router;
