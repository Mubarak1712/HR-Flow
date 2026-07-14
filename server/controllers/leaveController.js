const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Notification = require("../models/Notification");
const { countLeaveDays, getEmployeeForUser } = require("../utils/hrmsHelpers");

const createLeave = async (req, res) => {
  try {
    let employeeId = req.body.employee;

    if (req.user.role === "Employee") {
      let employee = await getEmployeeForUser(req.user);
      if (!employee) {
        employee = await Employee.create({ name: req.user.name || "", email: req.user.email, user: req.user._id, department: "Unassigned" });
      }
      employeeId = employee._id;
    }

    if (!employeeId) {
      return res.status(400).json({ message: "Employee is required" });
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return res.status(400).json({ message: "Please provide a valid leave range" });
    }

    const employee = await Employee.findById(employeeId);
    const days = countLeaveDays(startDate, endDate);
    if (employee && employee.leaveBalance < days) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    const leave = await Leave.create({ ...req.body, employee: employeeId, status: "Pending" });
    const populated = await leave.populate("employee", "name employeeId department");

    await Notification.create({
      employee: employeeId,
      title: "Leave Submitted",
      message: `Your ${leave.leaveType} leave request has been submitted for review.`,
      type: "General",
    });

    res.status(201).json({ message: "Leave request submitted", leave: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) return res.status(404).json({ message: "Employee profile not found" });
      query.employee = employee._id;
    }

    const leaves = await Leave.find(query)
      .populate("employee", "name employeeId department leaveBalance")
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("employee");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    const previousStatus = leave.status;
    leave.set({ ...req.body, reviewedBy: req.user._id });
    await leave.save();

    if (previousStatus !== "Approved" && leave.status === "Approved") {
      const days = countLeaveDays(leave.startDate, leave.endDate);
      await Employee.findByIdAndUpdate(leave.employee._id, {
        $inc: { leaveBalance: -days },
      });
      await Notification.create({
        employee: leave.employee._id,
        title: "Leave Approved",
        message: `Your ${leave.leaveType} leave was approved.`,
        type: "Leave Approved",
      });
    }

    if (leave.status === "Rejected") {
      await Notification.create({
        employee: leave.employee._id,
        title: "Leave Rejected",
        message: `Your ${leave.leaveType} leave was rejected.`,
        type: "Leave Rejected",
      });
    }

    const populated = await Leave.findById(leave._id).populate("employee", "name employeeId department leaveBalance");
    res.status(200).json({ message: "Leave request updated", leave: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    res.status(200).json({ message: "Leave request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLeave, getLeaves, updateLeave, deleteLeave };
