const express = require("express");
const router = express.Router();
const { getUsers, approveUser, deactivateUser, reactivateUser } = require("../controllers/userController");
const { getDashboardStats } = require("../controllers/dashboardController");
const {
  linkParentChild,
  unlinkParentChild,
  linkTutorStudent,
  unlinkTutorStudent,
  getLinkingOverview,
} = require("../controllers/linkController");
const { createFee, updateFeeStatus, getAllFees } = require("../controllers/feeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Every route below requires: logged in AND role === admin
router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/reactivate", reactivateUser);

router.get("/link/overview", getLinkingOverview);
router.patch("/link/parent-child", linkParentChild);
router.patch("/link/parent-child/remove", unlinkParentChild);
router.patch("/link/tutor-student", linkTutorStudent);
router.patch("/link/tutor-student/remove", unlinkTutorStudent);

router.get("/fees", getAllFees);
router.post("/fees", createFee);
router.patch("/fees/:id", updateFeeStatus);

module.exports = router;
