const Employee = require("../models/Employee");
const Task = require("../models/Task");

const getDashboard = async (req, res) => {
  try {
    // Statistics
    const totalEmployees = await Employee.countDocuments();

    const totalTasks = await Task.countDocuments();

    const pendingTasks = await Task.countDocuments({
      status: "Pending",
    });

    const completedTasks = await Task.countDocuments({
      status: "Completed",
    });

    const inProgressTasks = await Task.countDocuments({
      status: "In Progress",
    });

    const highPriority = await Task.countDocuments({
      priority: "High",
    });

    // Latest 5 Employees
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest 5 Tasks
    const recentTasks = await Task.find()
      .populate("employee", "name department")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalEmployees,
      totalTasks,
      pendingTasks,
      completedTasks,
      inProgressTasks,
      highPriority,
      recentEmployees,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};