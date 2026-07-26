const User = require("../models/User");

// @route  GET /api/parent/children
const getMyChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate(
      "children",
      "name email phone studentClass"
    );
    res.json({ children: parent.children });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch children", error: error.message });
  }
};

module.exports = { getMyChildren };
