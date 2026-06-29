const Notification = require("../models/Notification");

/**
 * Controller to fetch all notifications targeting the user's role or specific user ID.
 */
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.userId;
    const { category } = req.query;



    const query = {
      $or: [
        { recipient: userId },
        { recipientRole: userRole },
        { recipientRole: "All" },
      ],
    };

    if (category && category !== "all") {
      query.category = category;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    const formatted = notifications.map((notif) => {
      const isRead = notif.readBy.includes(userId);
      return {
        id: notif._id,
        title: notif.title,
        body: notif.body,
        category: notif.category,
        severity: notif.severity,
        time: notif.createdAt,
        unread: !isRead,
      };
    });

    res.status(200).json({ notifications: formatted });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

/**
 * Controller to mark a single notification as read by the current user.
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ message: "Notification marked as read successfully." });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ message: "Failed to update notification." });
  }
};

/**
 * Controller to mark all matching notifications as read by the current user.
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const query = {
      $or: [
        { recipient: userId },
        { recipientRole: userRole },
        { recipientRole: "All" },
      ],
      readBy: { $ne: userId },
    };

    await Notification.updateMany(query, {
      $addToSet: { readBy: userId },
    });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Error marking all notifications read:", err);
    res.status(500).json({ message: "Failed to mark all as read." });
  }
};
