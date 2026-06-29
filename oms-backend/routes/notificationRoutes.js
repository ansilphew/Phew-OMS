const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/mark-read", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
