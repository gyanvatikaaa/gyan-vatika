const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead, markAllRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/mine", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllRead);

module.exports = router;
