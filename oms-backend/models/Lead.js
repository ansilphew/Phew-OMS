const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: ["Referral", "Cold Call", "Website", "Social Media", "Email Campaign", "Walk-in", "Other"],
      default: "Referral",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    organization: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Meeting", "Proposal", "Close", "Lost"],
      default: "Contacted",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    activities: [
      {
        actorName: { type: String, required: true },
        action: { type: String, required: true },
        type: { type: String, default: "UPDATE" },
        notes: { type: String, default: "" },
        file: {
          name: String,
          size: String,
          url: String,
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    todos: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        dueDate: { type: Date },
        assignee: { type: String, default: "" },
        category: { type: String, default: "Creative" },
        description: { type: String, default: "" },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
