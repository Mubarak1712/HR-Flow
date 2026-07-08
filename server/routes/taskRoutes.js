const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, authMiddleware.authorize("Admin"), createTask);
router.get("/", authMiddleware.protect, getTasks);
router.get("/:id", authMiddleware.protect, getTaskById);
router.put("/:id", authMiddleware.protect, updateTask);
router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteTask);

module.exports = router;