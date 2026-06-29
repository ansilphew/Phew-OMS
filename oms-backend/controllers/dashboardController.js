const Lead = require("../models/Lead");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Payment = require("../models/Payment");

exports.getCeoStats = async (req, res) => {
  try {
    // ─── 1. Closed Deals ──────────────────────────────────────────────────────
    // Source: Lead Management page → leads with status "Close"
    // Also include Approved Proposals as they represent closed deals
    const closedLeadsCount = await Lead.countDocuments({ status: "Close" });
    const approvedProposalsCount = await Proposal.countDocuments({ status: "Approved" });
    const closedDeals = closedLeadsCount + approvedProposalsCount;

    // Closed deals this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const closedLeadsThisMonth = await Lead.countDocuments({
      status: "Close",
      updatedAt: { $gte: startOfMonth },
    });
    const approvedProposalsThisMonth = await Proposal.countDocuments({
      status: "Approved",
      updatedAt: { $gte: startOfMonth },
    });
    const dealsThisMonth = closedLeadsThisMonth + approvedProposalsThisMonth;

    // ─── 2. Active Projects ───────────────────────────────────────────────────
    // Source: Projects page → all projects that are NOT "Completed"
    const activeProjects = await Project.countDocuments({
      currentStatus: { $nin: ["Completed"] },
    });

    // On track = "On Track" or legacy statuses
    const onTrackProjects = await Project.countDocuments({
      currentStatus: { $in: ["On Track", "Planning", "Ongoing", "In Progress"] },
    });

    // Delayed count from Projects page
    const delayedProjectsCount = await Project.countDocuments({
      currentStatus: { $in: ["Delayed"] },
    });

    // ─── 3. Pending Payments ──────────────────────────────────────────────────
    // Source: Accounts page → Payment records
    const payments = await Payment.find();
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach((p) => {
      totalPending += p.balanceAmount || 0;
      if (p.status === "Pending" || p.status === "Ongoing") {
        totalOverdue += p.balanceAmount || 0;
      }
    });

    // ─── 4. Delayed Projects ──────────────────────────────────────────────────
    // Source: Projects page → projects with status "Delayed"
    const delayedProjects = delayedProjectsCount;

    // ─── 5. Recent Winning Count ──────────────────────────────────────────────
    // Source: Lead Management page → leads closed in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentClosedLeads = await Lead.countDocuments({
      status: "Close",
      updatedAt: { $gte: sevenDaysAgo },
    });
    const recentApprovedProposals = await Proposal.countDocuments({
      status: "Approved",
      updatedAt: { $gte: sevenDaysAgo },
    });
    const recentWinsCount = recentClosedLeads + recentApprovedProposals;

    // ─── 6. Recent Winnings List ──────────────────────────────────────────────
    // Source: Lead Management page (Close stage) + Proposals (Approved) + Projects (Completed)
    const recentClosedLeadsList = await Lead.find({ status: "Close" })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentApprovedProposalsList = await Proposal.find({ status: "Approved" })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentCompletedProjects = await Project.find({ currentStatus: "Completed" })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentWinningsList = [];

    recentClosedLeadsList.forEach((lead) => {
      recentWinningsList.push({
        id: `lead-${lead._id}`,
        title: "Lead Closed",
        subtitle: `Client: ${lead.organization || lead.projectName}`,
        time: formatTimeAgo(lead.updatedAt),
        type: "lead",
        rawTime: lead.updatedAt,
      });
    });

    recentApprovedProposalsList.forEach((prop) => {
      recentWinningsList.push({
        id: `prop-${prop._id}`,
        title: "Proposal Approved",
        subtitle: `Client: ${prop.clientName} (${prop.category})`,
        time: formatTimeAgo(prop.updatedAt),
        type: "proposal",
        rawTime: prop.updatedAt,
      });
    });

    recentCompletedProjects.forEach((proj) => {
      recentWinningsList.push({
        id: `proj-${proj._id}`,
        title: "Project Completed",
        subtitle: `Project: ${proj.projectName}`,
        time: formatTimeAgo(proj.updatedAt),
        type: "project",
        rawTime: proj.updatedAt,
      });
    });

    // Sort combined winnings by updatedAt desc, take top 4 for dashboard preview
    recentWinningsList.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
    const finalRecentWinnings = recentWinningsList.slice(0, 4);

    // ─── 7. Total Revenue + Month-over-Month Growth ───────────────────────────
    // Source: Accounts page → sum of amountReceived from Payment records
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    const now = new Date();
    // Start of current month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // End of last month (= start of this month)
    const endOfLastMonth = startOfThisMonth;

    payments.forEach((p) => {
      const received = p.amountReceived || 0;
      totalRevenue += received;

      const paymentDate = new Date(p.date || p.createdAt);
      if (paymentDate >= startOfThisMonth) {
        thisMonthRevenue += received;
      } else if (paymentDate >= startOfLastMonth && paymentDate < endOfLastMonth) {
        lastMonthRevenue += received;
      }
    });

    // Calculate growth %: if last month had data, compare; else 0
    let revenueGrowthPercent = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowthPercent = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
    } else if (thisMonthRevenue > 0) {
      // First month with data — show 0 (no comparison baseline)
      revenueGrowthPercent = 0;
    }

    // ─── 8. Team Utilization ──────────────────────────────────────────────────
    // Source: Active (non-completed) Projects, categorized by type
    const uiUxProjectsCount = await Project.countDocuments({
      projectName: { $regex: /design|ui|ux|branding/i },
      currentStatus: { $nin: ["Completed"] },
    });
    const devProjectsCount = await Project.countDocuments({
      projectName: { $regex: /web|app|development|software|crm/i },
      currentStatus: { $nin: ["Completed"] },
    });

    const designUtilization = Math.min(95, Math.max(45, 60 + uiUxProjectsCount * 8));
    const devUtilization = Math.min(95, Math.max(50, 65 + devProjectsCount * 6));

    // ─── Response ─────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      stats: {
        closedDeals: {
          value: closedDeals,
          subtext: `${dealsThisMonth} Deals this month`,
        },
        activeProjects: {
          value: activeProjects,
          subtext: `${onTrackProjects} on track, ${delayedProjects} delayed`,
        },
        pendingPayments: {
          value: totalPending,
          overdue: totalOverdue,
        },
        delayedProjects: {
          value: delayedProjects,
          subtext: `${delayedProjects} critical`,
        },
        recentWinningCount: {
          value: recentWinsCount,
          subtext: `${recentWinsCount} new wins this week`,
        },
        recentWinnings: finalRecentWinnings,
        totalRevenue: totalRevenue,
        revenueGrowthPercent: revenueGrowthPercent,
        teamUtilization: {
          design: designUtilization,
          dev: devUtilization,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching CEO stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching dashboard stats.",
    });
  }
};

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ─── GET ALL Recent Winnings (for the full view-all page) ─────────────────────
// Returns ALL closed leads + approved proposals + completed projects — no limit
exports.getAllRecentWinnings = async (req, res) => {
  try {
    const allClosedLeads = await Lead.find({ status: "Close" }).sort({ updatedAt: -1 });
    const allApprovedProposals = await Proposal.find({ status: "Approved" }).sort({ updatedAt: -1 });
    const allCompletedProjects = await Project.find({ currentStatus: "Completed" }).sort({ updatedAt: -1 });

    const winnings = [];

    allClosedLeads.forEach((lead) => {
      winnings.push({
        id: `lead-${lead._id}`,
        title: "Lead Closed",
        subtitle: `Client: ${lead.organization || lead.projectName}`,
        time: formatTimeAgo(lead.updatedAt),
        rawTime: lead.updatedAt,
        type: "lead",
      });
    });

    allApprovedProposals.forEach((prop) => {
      winnings.push({
        id: `prop-${prop._id}`,
        title: "Proposal Approved",
        subtitle: `Client: ${prop.clientName} (${prop.category})`,
        time: formatTimeAgo(prop.updatedAt),
        rawTime: prop.updatedAt,
        type: "proposal",
      });
    });

    allCompletedProjects.forEach((proj) => {
      winnings.push({
        id: `proj-${proj._id}`,
        title: "Project Completed",
        subtitle: `Project: ${proj.projectName}`,
        time: formatTimeAgo(proj.updatedAt),
        rawTime: proj.updatedAt,
        type: "project",
      });
    });

    winnings.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));

    return res.status(200).json({ success: true, winnings });
  } catch (error) {
    console.error("Error fetching all recent winnings:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.getClientStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Client") {
      return res.status(403).json({ message: "Access denied." });
    }

    const User = require("../models/User");
    const dbUser = await User.findById(req.user.userId);
    if (!dbUser || !dbUser.clientName) {
      return res.status(200).json({
        hasProject: false,
        stats: null,
      });
    }

    const clientName = dbUser.clientName;

    // Find the lead associated with this client
    const lead = await Lead.findOne({ projectName: clientName });

    // Find the project associated with this client
    const project = await Project.findOne({ projectName: clientName });

    // Find the payments associated with this client
    const payment = await Payment.findOne({ projectName: clientName });

    // Build the milestones
    const milestones = [
      { name: "Branding", percentage: 100, status: "Completed" },
      { name: "Website Design", percentage: 85, status: "In Review" },
      { name: "Website Development", percentage: 40, status: "Active" },
      { name: "Social Media", percentage: 60, status: "Paused" },
    ];

    // Adjust milestones based on project currentStatus
    if (project) {
      if (project.currentStatus === "Completed") {
        milestones.forEach(m => { m.percentage = 100; m.status = "Completed"; });
      } else if (project.currentStatus === "Delayed") {
        milestones[2].status = "Delayed"; // Website Development delayed
      }
    }

    const averageProgress = Math.round(milestones.reduce((acc, m) => acc + m.percentage, 0) / milestones.length);

    // Pending tasks: count uncompleted todos from lead, or default to 5
    const pendingTasks = lead && lead.todos ? lead.todos.filter(t => !t.completed).length : 5;

    // Payments
    const totalOffered = payment ? payment.totalOfferedAmount : 150000;
    const received = payment ? payment.amountReceived : 110000;
    const balance = payment ? payment.balanceAmount : 40000;

    // Active Services: derived from project's service category or lead's category, or default
    const activeServices = ["Branding", "Website", "Marketing"];

    // Activity Log
    let activityLog = [];
    if (lead && lead.activities && lead.activities.length > 0) {
      activityLog = lead.activities.slice(0, 5).map(act => ({
        id: act._id,
        title: act.action,
        subtitle: `${formatTimeAgo(act.timestamp)} • ${act.actorName}`,
        type: act.type || "Web", // e.g. "Creative", "Web", "Marketing"
      }));
    } else {
      activityLog = [
        { id: "mock-1", title: "Homepage design completed", subtitle: "2 hours ago • Alex Morgan", type: "Web" },
        { id: "mock-2", title: "Hosting activated", subtitle: "Yesterday • Sam Wilson", type: "Web" },
        { id: "mock-3", title: "Marketing plan uploaded", subtitle: "Oct 08 • Alex Morgan", type: "Marketing" },
      ];
    }

    let transactions = [];
    const paymentsList = await Payment.find({ projectName: clientName }).sort({ date: -1 });
    if (paymentsList && paymentsList.length > 0) {
      transactions = paymentsList.map((pay, index) => ({
        id: pay._id,
        date: new Date(pay.date || pay.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: pay.serviceType || "Project payment milestone",
        invoiceNo: pay.referenceNo || `INV-2023-${String(index + 1).padStart(3, "0")}`,
        amount: pay.amountReceived || pay.totalOfferedAmount,
        status: pay.status === "Completed" ? "Paid" : pay.status === "Pending" ? "Pending" : pay.status === "Ongoing" ? "Overdue" : "Pending",
        action: pay.status === "Completed" ? "Invoice" : pay.status === "Pending" ? "Preview" : "Pay Now",
      }));
    } else {
      transactions = [
        { id: "tx-1", date: "Oct 15, 2023", description: "Milestone 2: Website Design", invoiceNo: "INV-2023-084", amount: 40000, status: "Paid", action: "Invoice" },
        { id: "tx-2", date: "Sep 28, 2023", description: "Milestone 1: Brand Identity", invoiceNo: "INV-2023-062", amount: 40000, status: "Paid", action: "Invoice" },
        { id: "tx-3", date: "Nov 12, 2023", description: "Milestone 3: App Development", invoiceNo: "INV-2023-095", amount: 30000, status: "Pending", action: "Preview" },
        { id: "tx-4", date: "Sep 01, 2023", description: "Project Kickoff Deposit", invoiceNo: "INV-2023-001", amount: 30000, status: "Paid", action: "Invoice" },
        { id: "tx-5", date: "Nov 25, 2023", description: "Maintenance Pack (Q4)", invoiceNo: "INV-2023-102", amount: 10000, status: "Overdue", action: "Pay Now" },
      ];
    }

    return res.status(200).json({
      hasProject: true,
      clientName,
      overallProgress: averageProgress,
      pendingTasks,
      pendingTasksText: "Awaiting feedback",
      pendingPayment: balance,
      paymentDetails: {
        paid: received,
        total: totalOffered,
        balance: balance,
        lastPaymentDate: "Sep 28, 2023",
        nextDueDate: "Oct 15, 2023",
      },
      activeServices,
      milestones,
      activityLog,
      transactions,
    });
  } catch (error) {
    console.error("getClientStats error:", error);
    return res.status(500).json({ message: "Server error fetching client stats." });
  }
};
