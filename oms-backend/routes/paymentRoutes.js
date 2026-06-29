const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createPayment, getPayments, updatePayment, deletePayment } = require("../controllers/paymentController");

const router = express.Router();

router.post("/", protect, createPayment);
router.get("/", protect, getPayments);
router.put("/:id", protect, updatePayment);
router.delete("/:id", protect, deletePayment);

module.exports = router;
