const Proposal = require("../models/Proposal");
const notificationPipeline = require("../utils/notificationPipeline");

exports.createProposal = async (req, res) => {
  try {
    const { clientName, category, contactNumber, currency, date, amount, status } = req.body;

    if (!clientName || !contactNumber || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Client Name, Contact Number, and Amount are required.",
      });
    }

    const newProposal = new Proposal({
      clientName,
      category: category || "Creative Strategy",
      contactNumber,
      currency: currency || "INR",
      date: date ? new Date(date) : new Date(),
      amount: Number(amount) || 0,
      status: status || "Pending",
      createdBy: req.user ? req.user.id : null,
    });

    const savedProposal = await newProposal.save();

    // Trigger dynamic proposal notification in CEO dashboard alert panel
    try {
      await notificationPipeline.trigger({
        category: "proposals",
        title: `Proposal Created: ${clientName}`,
        body: `A new business proposal for "${clientName}" has been successfully drafted under category "${category || "Creative Strategy"}". Amount: ${currency || "INR"} ${Number(amount).toLocaleString("en-IN")}.`,
        recipientRole: "CEO",
        severity: "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate proposal notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Proposal drafted successfully.",
      proposal: savedProposal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to draft proposal.",
    });
  }
};

exports.getProposals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    const proposals = await Proposal.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve proposals.",
    });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }
    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve proposal.",
    });
  }
};


exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    // Trigger dynamic proposal update notification in CEO dashboard alert panel
    try {
      await notificationPipeline.trigger({
        category: "proposals",
        title: `Proposal ${proposal.status}: ${proposal.clientName}`,
        body: `Draft proposal for "${proposal.clientName}" has been marked as ${proposal.status.toLowerCase()}.`,
        recipientRole: "CEO",
        severity: proposal.status === "Rejected" ? "high" : "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate proposal update notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: "Proposal updated successfully.",
      proposal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update proposal.",
    });
  }
};

exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }
    res.status(200).json({
      success: true,
      message: "Proposal deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete proposal.",
    });
  }
};
