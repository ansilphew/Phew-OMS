const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getCeoStats, getAllRecentWinnings, getClientStats } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/ceo-stats", protect, getCeoStats);
router.get("/recent-winnings", protect, getAllRecentWinnings);
router.get("/client-stats", protect, getClientStats);

module.exports = router;
