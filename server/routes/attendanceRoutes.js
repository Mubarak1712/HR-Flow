const express = require("express");

const {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, authMiddleware.authorize("Admin"), createAttendance);

router.get("/", authMiddleware.protect, getAttendance);

router.put("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), updateAttendance);

router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteAttendance);

module.exports = router;