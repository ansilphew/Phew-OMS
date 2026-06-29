const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  getLeadProjects,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);
router.put("/profile", protect, updateUserProfile);
router.get("/lead-projects", getLeadProjects);

module.exports = router;
