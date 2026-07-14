const Attendance = require("../models/Attendance");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

const parseDateOnly = (value) => {
  if (!value) return new Date();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatTimeInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes(":")) return value.slice(0, 5);
  if (value instanceof Date) {
    return value.toTimeString().slice(0, 5);
  }
  return "";
};

const buildDateTime = (dateInput, timeInput) => {
  const baseDate = parseDateOnly(dateInput);
  const [hours = 0, minutes = 0] = (timeInput || "00:00").split(":").map(Number);
  baseDate.setHours(hours, minutes, 0, 0);
  return baseDate;
};

const normalizeAttendancePayload = (payload, reqUser) => {
  const nextPayload = { ...payload };

  if (nextPayload.date) {
    nextPayload.date = parseDateOnly(nextPayload.date);
  }

  if (nextPayload.checkIn) {
    nextPayload.checkIn = buildDateTime(nextPayload.date, nextPayload.checkIn);
  }

  if (nextPayload.checkOut) {
    nextPayload.checkOut = buildDateTime(nextPayload.date, nextPayload.checkOut);
  }

  if (reqUser.role === "Employee") {
    nextPayload.employee = reqUser.employee;
  }

  return nextPayload;
};

const getEmployeeIdForRequest = async (req, fallbackEmployeeId) => {
  if (req.user.role === "Employee") {
    const employee = await getEmployeeForUser(req.user);
    if (!employee) throw new Error("Employee profile not found");
    return employee._id;
  }

  return fallbackEmployeeId || req.body.employee;
};

const getAttendanceQuery = async (req) => {
  const query = {};

  if (req.user.role === "Employee") {
    const employee = await getEmployeeForUser(req.user);
    if (!employee) throw new Error("Employee profile not found");
    query.employee = employee._id;
  } else if (req.query.employee) {
    query.employee = req.query.employee;
  }

  if (req.query.startDate || req.query.endDate) {
    query.date = {};

    if (req.query.startDate) {
      query.date.$gte = parseDateOnly(req.query.startDate);
    }

    if (req.query.endDate) {
      query.date.$lte = parseDateOnly(req.query.endDate);
    }
  }

  return query;
};

const getTodayAttendanceRange = (dateInput) => {
  const start = parseDateOnly(dateInput);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const createAttendance = async (req, res) => {
  try {
    const payload = normalizeAttendancePayload(req.body, req.user);
    const employeeId = req.user.role === "Employee" ? await getEmployeeIdForRequest(req, null) : payload.employee;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee is required" });
    }

    payload.employee = employeeId;

    const attendance = await Attendance.create(payload);
    const populated = await attendance.populate("employee", "name employeeId department");
    res.status(201).json({ message: "Attendance saved successfully", attendance: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const query = await getAttendanceQuery(req);

    const attendance = await Attendance.find(query)
      .populate("employee", "name employeeId department")
      .sort({ date: -1 });

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clockInAttendance = async (req, res) => {
  try {
    const employeeId = await getEmployeeIdForRequest(req, req.body.employee);
    if (!employeeId) return res.status(400).json({ message: "Employee is required" });

    const dateValue = req.body.date || new Date();
    const { start, end } = getTodayAttendanceRange(dateValue);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    const clockInTime = buildDateTime(dateValue, req.body.checkIn || new Date().toTimeString().slice(0, 5));
    const status = clockInTime.getHours() > 9 || (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 0) ? "Late" : "Present";

    if (attendance) {
      if (attendance.checkIn) {
        return res.status(400).json({ message: "Already clocked in today" });
      }

      attendance.checkIn = clockInTime;
      attendance.status = status;
      await attendance.save();
      const populated = await attendance.populate("employee", "name employeeId department");
      return res.status(200).json({ message: "Clocked in successfully", attendance: populated });
    }

    attendance = await Attendance.create({
      employee: employeeId,
      date: start,
      checkIn: clockInTime,
      status,
    });

    const populated = await attendance.populate("employee", "name employeeId department");
    return res.status(201).json({ message: "Clocked in successfully", attendance: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clockOutAttendance = async (req, res) => {
  try {
    const employeeId = await getEmployeeIdForRequest(req, req.body.employee);
    if (!employeeId) return res.status(400).json({ message: "Employee is required" });

    const dateValue = req.body.date || new Date();
    const { start, end } = getTodayAttendanceRange(dateValue);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance record found for today" });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({ message: "Please clock in before clocking out" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already clocked out today" });
    }

    const clockOutTime = buildDateTime(dateValue, req.body.checkOut || new Date().toTimeString().slice(0, 5));
    attendance.checkOut = clockOutTime;
    attendance.status = attendance.status === "Late" ? "Late" : "Present";
    await attendance.save();
    const populated = await attendance.populate("employee", "name employeeId department");
    return res.status(200).json({ message: "Clocked out successfully", attendance: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceReports = async (req, res) => {
  try {
    const query = await getAttendanceQuery(req);
    const records = await Attendance.find(query)
      .populate("employee", "name employeeId department")
      .sort({ date: -1 });

    const presentCount = records.filter((record) => record.status === "Present").length;
    const lateCount = records.filter((record) => record.status === "Late").length;
    const absentCount = records.filter((record) => record.status === "Absent").length;
    const totalCount = records.length;

    res.status(200).json({
      summary: {
        totalCount,
        presentCount,
        lateCount,
        absentCount,
        onTimeRate: totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100),
      },
      records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  let payload;
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    // If client sent time-only strings for checkIn/checkOut, coerce them using existing attendance.date
    let coercedCheckIn;
    let coercedCheckOut;
    if (req.body.checkIn && typeof req.body.checkIn === "string") {
      coercedCheckIn = buildDateTime(attendance.date, req.body.checkIn);
    }
    if (req.body.checkOut && typeof req.body.checkOut === "string") {
      coercedCheckOut = buildDateTime(attendance.date, req.body.checkOut);
    }

    const payload = normalizeAttendancePayload(req.body, req.user);
    if (coercedCheckIn) payload.checkIn = coercedCheckIn;
    if (coercedCheckOut) payload.checkOut = coercedCheckOut;
    // Only admins can modify employee; otherwise employee field should remain
    if (req.user.role === "Employee") delete payload.employee;

      // Assign fields explicitly to avoid accidental type cast of date strings
    if (payload.date !== undefined) attendance.date = payload.date;
    if (payload.checkIn !== undefined) attendance.checkIn = payload.checkIn;
    if (payload.checkOut !== undefined) attendance.checkOut = payload.checkOut;
    if (payload.status !== undefined) attendance.status = payload.status;
    if (payload.employee !== undefined && req.user.role !== "Employee") attendance.employee = payload.employee;
      await attendance.save();
      const populated = await Attendance.findById(attendance._id).populate("employee", "name employeeId department");
      res.status(200).json({ message: "Attendance updated successfully", attendance: populated });
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

module.exports = {
  createAttendance,
  getAttendance,
  clockInAttendance,
  clockOutAttendance,
  getAttendanceReports,
  updateAttendance,
  deleteAttendance,
};
