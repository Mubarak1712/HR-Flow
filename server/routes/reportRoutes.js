const express = require("express");
const { getReports } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, authMiddleware.authorize("Admin"), getReports);

module.exports = router;
