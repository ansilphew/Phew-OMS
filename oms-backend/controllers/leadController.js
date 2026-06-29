const Lead = require("../models/Lead");
const notificationPipeline = require("../utils/notificationPipeline");

/**
 * Create a new lead.
 * POST /api/leads
 */
exports.createLead = async (req, res) => {
  try {
    const { projectName, designation, email, source, phone, organization, address, priority, status } = req.body;

    if (!projectName) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const lead = await Lead.create({
      projectName,
      designation,
      email,
      source,
      phone,
      organization,
      address,
      priority: priority || "Medium",
      status: status || "Contacted",
      createdBy: req.user.userId,
    });

    // Trigger high-fidelity notification dynamically in the pipeline
    try {
      const bdeName = req.user && req.user.fullName ? req.user.fullName : "Team Member";
      await notificationPipeline.trigger({
        category: "leads",
        title: `New Lead Added: ${projectName}`,
        body: `A new sales lead "${projectName}" from organization "${organization || "Unknown Org"}" has been successfully added to the pipeline by BDE ${bdeName}.`,
        recipientRole: "CEO",
        severity: priority === "High" ? "high" : "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate lead notification:", notifErr);
    }

    res.status(201).json({ message: "Lead created successfully.", lead });
  } catch (err) {
    console.error("Error creating lead:", err);
    res.status(500).json({ message: "Failed to create lead." });
  }
};

/**
 * Get all leads.
 * GET /api/leads
 */
exports.getLeads = async (req, res) => {
  try {
    const { status, source, search } = req.query;

    const query = {};

    if (status && status !== "all") query.status = status;
    if (source && source !== "all") query.source = source;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.status(200).json({ leads });
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ message: "Failed to fetch leads." });
  }
};

/**
 * Get a single lead by ID.
 * GET /api/leads/:id
 */
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("createdBy", "fullName email");
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    res.status(200).json({ lead });
  } catch (err) {
    console.error("Error fetching lead:", err);
    res.status(500).json({ message: "Failed to fetch lead." });
  }
};

/**
 * Update a lead.
 * PUT /api/leads/:id
 */
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    res.status(200).json({ message: "Lead updated successfully.", lead });
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ message: "Failed to update lead." });
  }
};

/**
 * Delete a lead.
 * DELETE /api/leads/:id
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    res.status(200).json({ message: "Lead deleted successfully." });
  } catch (err) {
    console.error("Error deleting lead:", err);
    res.status(500).json({ message: "Failed to delete lead." });
  }
};
