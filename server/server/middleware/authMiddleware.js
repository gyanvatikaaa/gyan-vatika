const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT AND re-checks account status on every request.
// This is what makes "admin deactivates account -> user instantly locked out" work,
// even if the user still has an old token saved in their browser.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is still pending admin approval" });
    }

    if (user.status === "deactivated") {
      return res.status(403).json({ message: "Your account has been deactivated by the admin" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// Restricts a route to specific roles, e.g. authorizeRoles("admin", "tutor")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this resource" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
