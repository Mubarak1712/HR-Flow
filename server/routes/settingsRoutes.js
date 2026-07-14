const express = require("express");

const {
  getCompanySettings,
  updateCompanySettings,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, authMiddleware.authorize("Admin"), getCompanySettings);

router.put("/", authMiddleware.protect, authMiddleware.authorize("Admin"), updateCompanySettings);

module.exports = router;