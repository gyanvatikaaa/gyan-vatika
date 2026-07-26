const express = require("express");
const router = express.Router();
const { uploadFile } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/file", uploadFile);

module.exports = router;
