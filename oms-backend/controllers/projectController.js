const Project = require("../models/Project");
const notificationPipeline = require("../utils/notificationPipeline");

exports.createProject = async (req, res) => {
  try {
    const { 
      projectName, iscoCode, startDate, endDate, amount, gstAmount, hosting, domain, currentStatus,
      serviceCategory, displayTitle, completionDate, heroImage, totalAmount
    } = req.body;
    if (!projectName) return res.status(400).json({ message: "Project name is required." });

    let uploadedHeroImage = "";
    if (heroImage) {
      const { uploadImage } = require("../utils/cloudinary");
      uploadedHeroImage = await uploadImage(heroImage, "projects");
    }

    const project = await Project.create({
      projectName, iscoCode, startDate, endDate, amount, gstAmount, hosting, domain,
      currentStatus: currentStatus || "On Track",
      serviceCategory, displayTitle, completionDate,
      heroImage: uploadedHeroImage,
      totalAmount,
      createdBy: req.user.userId,
    });

    // Trigger dynamic project notification in CEO dashboard alert panel
    try {
      await notificationPipeline.trigger({
        category: "projects",
        title: `New Project Added: ${projectName}`,
        body: `A new client project "${projectName}" has been successfully created and scheduled with status "${project.currentStatus}".`,
        recipientRole: "CEO",
        severity: "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate project notification:", notifErr);
    }

    res.status(201).json({ message: "Project created.", project });
  } catch (err) {
    console.error("createProject error:", err);
    res.status(500).json({ message: "Failed to create project." });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === "Client") {
      const User = require("../models/User");
      const dbUser = await User.findById(req.user.userId);
      if (dbUser && dbUser.clientName) {
        query.projectName = dbUser.clientName;
      } else {
        return res.status(200).json({ projects: [] });
      }
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (err) {
    console.error("getProjects error:", err);
    res.status(500).json({ message: "Failed to fetch projects." });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (req.user && req.user.role === "Client") {
      const User = require("../models/User");
      const dbUser = await User.findById(req.user.userId);
      if (!dbUser || dbUser.clientName !== project.projectName) {
        return res.status(403).json({ message: "Access denied to this project." });
      }
    }

    res.status(200).json({ project });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project." });
  }
};

exports.updateProject = async (req, res) => {
  try {
    if (req.body.heroImage) {
      const { uploadImage } = require("../utils/cloudinary");
      req.body.heroImage = await uploadImage(req.body.heroImage, "projects");
    }
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: "Project not found." });

    // Trigger dynamic project update notification in CEO dashboard alert panel
    try {
      await notificationPipeline.trigger({
        category: "projects",
        title: `Project Updated: ${project.projectName}`,
        body: `Project "${project.projectName}" has been updated with status "${project.currentStatus || "In Progress"}".`,
        recipientRole: "CEO",
        severity: "normal",
      });
    } catch (notifErr) {
      console.error("Failed to generate project update notification:", notifErr);
    }

    res.status(200).json({ message: "Project updated.", project });
  } catch (err) {
    res.status(500).json({ message: "Failed to update project." });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.status(200).json({ message: "Project deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project." });
  }
};
