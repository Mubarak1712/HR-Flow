const express = require("express");

const {
  createLeave,
  getLeaves,
  updateLeave,
  deleteLeave,
} = require("../controllers/leaveController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, createLeave);

router.get("/", authMiddleware.protect, getLeaves);

router.put("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), updateLeave);

router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteLeave);

module.exports = router;