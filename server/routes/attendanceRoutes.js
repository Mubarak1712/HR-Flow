const express = require("express");

const {
  createAttendance,
  getAttendance,
  clockInAttendance,
  clockOutAttendance,
  getAttendanceReports,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, createAttendance);
router.post("/clock-in", authMiddleware.protect, clockInAttendance);
router.post("/clock-out", authMiddleware.protect, clockOutAttendance);
router.get("/reports", authMiddleware.protect, getAttendanceReports);
router.get("/", authMiddleware.protect, getAttendance);
router.put("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), updateAttendance);
router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteAttendance);

module.exports = router;