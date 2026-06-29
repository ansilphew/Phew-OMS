const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    projectName: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    totalOfferedAmount: {
      type: Number,
      default: 0,
    },
    amountReceived: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Pending", "Cancelled", "On Hold"],
      default: "Ongoing",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    referenceNo: {
      type: String,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
