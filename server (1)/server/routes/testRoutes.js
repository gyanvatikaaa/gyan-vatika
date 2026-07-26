const express = require("express");
const router = express.Router();
const {
  generateAITest,
  createManualTest,
  getTests,
  getTestById,
  publishTest,
  updateTest,
} = require("../controllers/testController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("admin", "tutor"));

router.post("/generate-ai", generateAITest);
router.post("/manual", createManualTest);
router.get("/", getTests);
router.get("/:id", getTestById);
router.patch("/:id/publish", publishTest);
router.patch("/:id", updateTest);

module.exports = router;
