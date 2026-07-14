const express = require("express");

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.protect, authMiddleware.authorize("Admin"), createDepartment);

router.get("/", authMiddleware.protect, authMiddleware.authorize("Admin"), getDepartments);
router.put("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), updateDepartment);
router.delete("/:id", authMiddleware.protect, authMiddleware.authorize("Admin"), deleteDepartment);

module.exports = router;