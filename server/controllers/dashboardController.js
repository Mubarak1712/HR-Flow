const Employee = require("../models/Employee");
const Task = require("../models/Task");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

const getDashboard = async (req, res) => {
  try {
    const role = req.user.role === "Admin" ? "Admin" : "Employee";

    if (role === "Admin") {
      const totalEmployees = await Employee.countDocuments();
      const activeEmployees = await Employee.countDocuments({ status: "Active" });
      const departments = await (await require("../models/Department"))?.countDocuments?.() || 0;
      const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
      const pendingTasks = await Task.countDocuments({ status: "Pending" });
      const todaysAttendance = await Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      });
      const payrollSummary = await Salary.aggregate([{ $group: { _id: null, total: { $sum: "$netSalary" } } }]);
      const recentActivities = await Notification.find().sort({ createdAt: -1 }).limit(5);

      return res.status(200).json({
        role,
        totalEmployees,
        activeEmployees,
        departments,
        pendingLeaves,
        todaysAttendance,
        pendingTasks,
        payrollSummary: payrollSummary[0]?.total || 0,
        recentActivities,
        permissions: {
          manageEmployees: true,
          manageSettings: true,
          accessAdminModules: true,
        },
      });
    }

    let employee = await getEmployeeForUser(req.user);
    if (!employee) {
      employee = await Employee.create({
        name: req.user.name,
        email: req.user.email,
        department: "General",
        position: "Employee",
        designation: "Employee",
        role: req.user.role || "Employee",
        user: req.user._id,
      });

      await req.user.updateOne({ employee: employee._id });
    }

    const assignedTasks = await Task.find({ $or: [{ employee: employee._id }, { assignedTo: employee._id }] }).populate("employee assignedTo assignedBy", "name email employeeId department").sort({ createdAt: -1 }).limit(6);
    const completedTaskCount = assignedTasks.filter((task) => task.status === "Completed").length;
    const percentage = assignedTasks.length ? Math.round((completedTaskCount / assignedTasks.length) * 100) : 0;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const attendance = await Attendance.findOne({ employee: employee._id, date: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const latestSalary = await Salary.findOne({ employee: employee._id }).sort({ createdAt: -1 });
    const notifications = await Notification.find({ employee: employee._id }).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      role,
      employeeName: employee.name,
      assignedTasks,
      taskProgress: percentage,
      attendance,
      leaveBalance: employee.leaveBalance,
      latestSalary,
      notifications,
      profileCompletion: Math.min(100, 60 + (employee.phone ? 10 : 0) + (employee.address ? 10 : 0) + (employee.profilePhoto ? 20 : 0)),
      permissions: {
        manageEmployees: false,
        manageSettings: false,
        accessAdminModules: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
};