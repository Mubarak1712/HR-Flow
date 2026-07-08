const Notification = require("../models/Notification");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

const getNotifications = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) return res.status(404).json({ message: "Employee profile not found" });
      query.$or = [{ employee: employee._id }, { user: req.user._id }];
    }

    const notifications = await Notification.find(query)
      .populate("employee", "name employeeId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markNotificationRead };
