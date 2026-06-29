const Payment = require("../models/Payment");
const notificationPipeline = require("../utils/notificationPipeline");

exports.createPayment = async (req, res) => {
  try {
    const {
      project,
      projectName,
      serviceType,
      totalOfferedAmount,
      amountReceived,
      balanceAmount,
      status,
      date,
      referenceNo,
    } = req.body;

    if (!projectName || !serviceType || !referenceNo) {
      return res.status(400).json({
        success: false,
        message: "Project Name, Service Type, and Reference No. are required.",
      });
    }

    const newPayment = new Payment({
      project: project || null,
      projectName,
      serviceType,
      totalOfferedAmount: Number(totalOfferedAmount) || 0,
      amountReceived: Number(amountReceived) || 0,
      balanceAmount: Number(balanceAmount) || 0,
      status: status || "Ongoing",
      date: date ? new Date(date) : new Date(),
      referenceNo,
      recordedBy: req.user ? req.user.id : null,
    });

    const savedPayment = await newPayment.save();

    // Trigger dynamic, high-fidelity payment notification in CEO dashboard alert panel
    try {
      const formattedAmount = Number(amountReceived).toLocaleString("en-IN");
      await notificationPipeline.trigger({
        category: "payments",
        title: `Payment Received: ₹${formattedAmount}`,
        body: `Invoice #${referenceNo} has been successfully settled via NEFT transfer.`,
        recipientRole: "CEO",
        severity: "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate payment notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Payment transaction recorded successfully.",
      payment: savedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to record payment transaction.",
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve payments history.",
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, projectName, serviceType, totalOfferedAmount, amountReceived, balanceAmount, date, referenceNo } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment transaction not found." });
    }

    if (status) payment.status = status;
    if (projectName) payment.projectName = projectName;
    if (serviceType) payment.serviceType = serviceType;
    if (totalOfferedAmount !== undefined) payment.totalOfferedAmount = Number(totalOfferedAmount) || 0;
    if (amountReceived !== undefined) payment.amountReceived = Number(amountReceived) || 0;
    if (balanceAmount !== undefined) payment.balanceAmount = Number(balanceAmount) || 0;
    if (date) payment.date = new Date(date);
    if (referenceNo) payment.referenceNo = referenceNo;

    const updated = await payment.save();
    res.status(200).json({ success: true, message: "Payment updated successfully.", payment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update payment." });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment transaction not found." });
    }
    res.status(200).json({ success: true, message: "Payment deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete payment." });
  }
};
