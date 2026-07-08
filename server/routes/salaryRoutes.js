const express = require("express");

const {
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary,
} = require("../controllers/salaryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, authMiddleware.authorize("Admin"), createSalary);

router.get("/", authMiddleware.protect, getSalaries);

router.put("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), updateSalary);

router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteSalary);

module.exports = router;