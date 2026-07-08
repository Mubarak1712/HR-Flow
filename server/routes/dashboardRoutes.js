const express = require("express");

const { getDashboard } = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware.protect, getDashboard);

module.exports = router;