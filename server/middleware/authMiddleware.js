const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  (async () => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.status && user.status !== "Active") {
        return res.status(403).json({ message: "Account is inactive" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid Token", error: error.message });
    }
  })();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to access this resource" });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
