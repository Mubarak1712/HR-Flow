const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Task = require("../models/Task");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Salary = require("../models/Salary");

const getRangeBounds = (range = "monthly") => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (range) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(now.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    case "monthly":
    default:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

const getBucketConfig = (range) => {
  if (range === "daily") {
    return { count: 7, step: "day", label: (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  }
  if (range === "weekly") {
    return { count: 6, step: "week", label: (date) => `W${date.getWeekNumber()}` };
  }
  if (range === "yearly") {
    return { count: 5, step: "year", label: (date) => date.getFullYear().toString() };
  }
  return { count: 6, step: "month", label: (date) => date.toLocaleDateString("en-US", { month: "short" }) };
};

Date.prototype.getWeekNumber = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const buildBuckets = (range) => {
  const { count, step, label } = getBucketConfig(range);
  const now = new Date();
  const buckets = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const bucket = new Date(now);
    if (step === "day") {
      bucket.setDate(now.getDate() - index);
      bucket.setHours(0, 0, 0, 0);
    } else if (step === "week") {
      bucket.setDate(now.getDate() - index * 7);
      bucket.setHours(0, 0, 0, 0);
    } else if (step === "month") {
      bucket.setMonth(now.getMonth() - index, 1);
      bucket.setHours(0, 0, 0, 0);
    } else {
      bucket.setFullYear(now.getFullYear() - index, 0, 1);
      bucket.setHours(0, 0, 0, 0);
    }

    buckets.push({
      label: label(bucket),
      start: bucket,
      end: step === "day"
        ? new Date(bucket.getFullYear(), bucket.getMonth(), bucket.getDate(), 23, 59, 59, 999)
        : step === "week"
          ? new Date(bucket.getFullYear(), bucket.getMonth(), bucket.getDate() + 7, 23, 59, 59, 999)
          : step === "month"
            ? new Date(bucket.getFullYear(), bucket.getMonth() + 1, 1, 23, 59, 59, 999)
            : new Date(bucket.getFullYear() + 1, 0, 1, 23, 59, 59, 999),
    });
  }

  return buckets;
};

const getReports = async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getRangeBounds(range);

    const [employees, departments, tasks, leaves, attendanceRecords, salaries] = await Promise.all([
      Employee.find({ createdAt: { $gte: start, $lte: end } }),
      Department.countDocuments(),
      Task.find({ createdAt: { $gte: start, $lte: end } }),
      Leave.find({ createdAt: { $gte: start, $lte: end } }),
      Attendance.find({ date: { $gte: start, $lte: end } }),
      Salary.find({ createdAt: { $gte: start, $lte: end } }),
    ]);

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    const completedTasks = tasks.filter((task) => task.status === "Completed").length;
    const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
    const totalTasks = tasks.length;
    const attendancePercentage = attendanceRecords.length === 0
      ? 0
      : Math.round((attendanceRecords.filter((record) => record.status === "Present").length / attendanceRecords.length) * 100);
    const approvedLeaves = leaves.filter((leave) => leave.status === "Approved").length;
    const pendingLeaveRequests = leaves.filter((leave) => leave.status === "Pending").length;
    const totalPayroll = salaries.reduce((sum, item) => sum + Number(item.netSalary || 0), 0);

    const employeeGrowth = buildBuckets(range).map((bucket) => ({
      label: bucket.label,
      value: employees.filter((employee) => employee.createdAt >= bucket.start && employee.createdAt <= bucket.end).length,
    }));

    const taskStatus = [
      { label: "Completed", value: completedTasks },
      { label: "Pending", value: pendingTasks },
      { label: "In Progress", value: tasks.filter((task) => task.status === "In Progress").length },
    ];

    const attendanceTrend = buildBuckets(range).map((bucket) => ({
      label: bucket.label,
      value: attendanceRecords.filter((record) => record.date >= bucket.start && record.date <= bucket.end).length,
    }));

    const leaveDistribution = [
      { label: "Approved", value: approvedLeaves },
      { label: "Pending", value: pendingLeaveRequests },
      { label: "Rejected", value: leaves.filter((leave) => leave.status === "Rejected").length },
    ];

    const payrollSummary = buildBuckets(range).map((bucket) => ({
      label: bucket.label,
      value: salaries.filter((salary) => salary.createdAt >= bucket.start && salary.createdAt <= bucket.end).reduce((sum, item) => sum + Number(item.netSalary || 0), 0),
    }));

    const hasData = totalEmployees > 0 || departments > 0 || totalTasks > 0 || attendanceRecords.length > 0 || leaves.length > 0 || salaries.length > 0;

    res.status(200).json({
      range,
      summary: {
        totalEmployees,
        activeEmployees,
        totalDepartments: departments,
        totalTasks,
        completedTasks,
        pendingTasks,
        attendancePercentage,
        approvedLeaves,
        pendingLeaveRequests,
        totalPayroll,
      },
      charts: {
        employeeGrowth,
        taskStatus,
        attendanceTrend,
        leaveDistribution,
        payrollSummary,
      },
      hasData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReports,
};
