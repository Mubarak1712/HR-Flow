const express = require("express");

const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, getNotifications);

router.put("/:id", authMiddleware.protect, markNotificationRead);

module.exports = router;