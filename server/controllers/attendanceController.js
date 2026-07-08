const Attendance = require("../models/Attendance");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    const populated = await attendance.populate("employee", "name employeeId department");
    res.status(201).json({ message: "Attendance saved successfully", attendance: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) return res.status(404).json({ message: "Employee profile not found" });
      query.employee = employee._id;
    } else if (req.query.employee) {
      query.employee = req.query.employee;
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "name employeeId department")
      .sort({ date: -1 });

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("employee", "name employeeId department");

    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAttendance, getAttendance, updateAttendance, deleteAttendance };
