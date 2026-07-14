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

router.post("/", authMiddleware.protect, authMiddleware.authorize("Admin"), createEmployee);
router.get("/", authMiddleware.protect, getEmployees);
router.get("/:id", authMiddleware.protect, getEmployeeById);
router.put("/:id", authMiddleware.protect, updateEmployee);
router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteEmployee);

router.use((err, req, res, next) => {
  console.error("employeeRoutes error", err);
  res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
});

module.exports = router;