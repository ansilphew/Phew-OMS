const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
} = require("../controllers/proposalController");

const router = express.Router();

router.post("/", protect, createProposal);
router.get("/", protect, getProposals);
router.get("/:id", protect, getProposalById);
router.put("/:id", protect, updateProposal);
router.delete("/:id", protect, deleteProposal);

module.exports = router;
