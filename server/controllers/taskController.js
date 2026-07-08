const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

// Create Task
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedBy: req.user._id,
      assignedTo: req.body.assignedTo || req.body.employee,
      employee: req.body.employee || req.body.assignedTo,
    });
    const populated = await task.populate("employee assignedTo", "name employeeId department");

    await Notification.create({
      employee: task.employee,
      title: "Task Assigned",
      message: `${task.title} has been assigned to you.`,
      type: "Task Assigned",
    });

    res.status(201).json({
      message: "Task Created Successfully",
      task: populated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) return res.status(404).json({ message: "Employee profile not found" });
      query.$or = [{ employee: employee._id }, { assignedTo: employee._id }];
    }

    const tasks = await Task.find(query).populate("employee assignedTo assignedBy", "name email employeeId department");

    res.status(200).json({
      message: "Tasks Fetched Successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("employee assignedTo");

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      const existingTask = await Task.findById(req.params.id);
      if (!employee || existingTask?.employee?.toString() !== employee._id.toString()) {
        return res.status(403).json({ message: "You can only update your own tasks" });
      }

      req.body = {
        status: req.body.status,
        actualHours: req.body.actualHours,
        remarks: req.body.remarks,
      };
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        assignedTo: req.body.assignedTo || req.body.employee,
        employee: req.body.employee || req.body.assignedTo,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("employee assignedTo");

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found",
      });
    }

    res.status(200).json({
      message: "Task Updated Successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found",
      });
    }

    res.status(200).json({
      message: "Task Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
