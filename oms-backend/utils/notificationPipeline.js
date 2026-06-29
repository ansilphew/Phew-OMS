const Notification = require("../models/Notification");

/**
 * Centrally processes system actions and dispatches notifications to appropriate role modules.
 * This acts as a robust, automated backend data pipeline.
 */
class NotificationPipeline {
  /**
   * General event dispatcher to log and save notifications in the database.
   */
  async trigger(payload) {
    const {
      category,
      title,
      body,
      recipient = null,
      recipientRole = "All",
      severity = "normal",
    } = payload;

    try {
      const notification = new Notification({
        recipient,
        recipientRole,
        title,
        body,
        category,
        severity,
      });

      await notification.save();
      console.log(
        `[NotificationPipeline] Dispatched and saved notification: "${title}" to role: "${recipientRole}"`
      );
      return notification;
    } catch (err) {
      console.error("[NotificationPipeline] Error dispatching notification:", err);
      throw err;
    }
  }

  /**
   * Automatically dispatches Lead events to the CEO module.
   */
  async dispatchLeadActivity(leadName, actionType, bdeName) {
    return this.trigger({
      category: "leads",
      title: `Lead ${actionType}: ${leadName}`,
      body: `BDE ${bdeName} has ${actionType.toLowerCase()} lead "${leadName}" in the pipeline.`,
      recipientRole: "CEO",
      severity: "normal",
    });
  }

  /**
   * Automatically dispatches Proposal events to the CEO module.
   */
  async dispatchProposalUpdate(proposalName, status, clientName) {
    return this.trigger({
      category: "proposals",
      title: `Proposal ${status}: ${proposalName}`,
      body: `The proposal "${proposalName}" for client "${clientName}" has been marked as ${status.toLowerCase()}.`,
      recipientRole: "CEO",
      severity: status === "Approved" ? "normal" : "high",
    });
  }

  /**
   * Automatically dispatches Project events to the CEO module.
   */
  async dispatchProjectMilestone(projectName, milestoneName, status) {
    return this.trigger({
      category: "projects",
      title: `Project Milestone: ${milestoneName}`,
      body: `Milestone "${milestoneName}" for project "${projectName}" has been marked as ${status.toLowerCase()}.`,
      recipientRole: "CEO",
      severity: status === "Delayed" ? "high" : "normal",
    });
  }

  /**
   * Automatically dispatches Payment events to the CEO module.
   */
  async dispatchPaymentAlert(amount, invoiceNumber, status) {
    return this.trigger({
      category: "payments",
      title: `Payment ${status}: ₹${amount}`,
      body: `Billing invoice ${invoiceNumber} has been marked as ${status.toLowerCase()}.`,
      recipientRole: "CEO",
      severity: status === "Overdue" ? "critical" : "normal",
    });
  }

  /**
   * Automatically dispatches System alerts to all users.
   */
  async dispatchSystemAlert(message, severity = "high") {
    return this.trigger({
      category: "system",
      title: "System Alert",
      body: message,
      recipientRole: "All",
      severity,
    });
  }
}

module.exports = new NotificationPipeline();
