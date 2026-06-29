const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    iscoCode: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    amount: {
      type: String,
      default: "",
    },
    gstAmount: {
      type: String,
      default: "",
    },
    hosting: {
      type: String,
      default: "",
    },
    domain: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: String,
      default: "",
    },
    currentStatus: {
      type: String,
      default: "On Track",
    },
    serviceCategory: {
      type: String,
      default: "",
    },
    displayTitle: {
      type: String,
      default: "",
    },
    completionDate: {
      type: Date,
      default: null,
    },
    heroImage: {
      type: String,
      default: "",
    },
    blocker: {
      type: String,
      default: "",
    },
    needsAttention: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
