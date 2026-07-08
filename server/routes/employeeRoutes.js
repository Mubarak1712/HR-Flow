const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, createEmployee);
router.get("/", authMiddleware.protect, getEmployees);
router.get("/:id", authMiddleware.protect, getEmployeeById);
router.put("/:id", authMiddleware.protect, updateEmployee);
router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteEmployee);

module.exports = router;