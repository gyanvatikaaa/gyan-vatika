const express = require("express");
const router = express.Router();
const { getMyChildren } = require("../controllers/parentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("parent"));

router.get("/children", getMyChildren);

module.exports = router;
