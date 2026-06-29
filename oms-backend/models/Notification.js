const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null indicates a broader broadcast (by recipientRole or to everyone)
    },
    recipientRole: {
      type: String,
      enum: ["CEO", "BDE", "Accountant", "Project Manager", "Client", "All"],
      default: "All", // Direct to specific role pipeline module or All
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["leads", "proposals", "projects", "payments", "system"],
      default: "system",
    },
    severity: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "normal",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
