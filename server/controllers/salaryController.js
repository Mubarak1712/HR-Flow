const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Notification = require("../models/Notification");
const Salary = require("../models/Salary");
const { countLeaveDays, getEmployeeForUser, getMonthRange, getSettings } = require("../utils/hrmsHelpers");

const calculateLeaveDeduction = async (employeeId, month) => {
  const settings = await getSettings();
  const { start, end } = getMonthRange(month);

  const approvedLeaves = await Leave.find({
    employee: employeeId,
    status: "Approved",
    startDate: { $lt: end },
    endDate: { $gte: start },
  });

  const leaveDays = approvedLeaves.reduce((total, leave) => {
    return total + countLeaveDays(leave.startDate, leave.endDate);
  }, 0);

  const extraLeaves = Math.max(leaveDays - settings.monthlyLeaveLimit, 0);
  return extraLeaves * settings.salaryDeductionPerExtraLeave;
};

const createSalary = async (req, res) => {
  try {
    const { employee: employeeId, month, baseSalary, bonus, allowance, tax, leaveDeduction } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ message: "Employee and month are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const computedLeaveDeduction =
      leaveDeduction !== undefined
        ? Number(leaveDeduction)
        : await calculateLeaveDeduction(employee._id, month);

    const salary = await Salary.create({
      employee: employee._id,
      baseSalary: Number(baseSalary ?? employee.salary ?? 0),
      bonus: Number(bonus || 0),
      allowance: Number(allowance || 0),
      tax: Number(tax || 0),
      leaveDeduction: computedLeaveDeduction,
      month,
    });

    await Notification.create({
      employee: employee._id,
      title: "Salary Generated",
      message: `Salary for ${month} has been generated.`,
      type: "Salary Generated",
    });

    const populated = await salary.populate("employee", "name employeeId department");
    res.status(201).json({ message: "Salary generated successfully", salary: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalaries = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) return res.status(404).json({ message: "Employee profile not found" });
      query.employee = employee._id;
    }

    const salaries = await Salary.find(query)
      .populate("employee", "name employeeId department")
      .sort({ createdAt: -1 });

    res.status(200).json({ salaries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary not found" });

    // apply updates
    salary.set(req.body);

    // if leaveDeduction not provided but month changed or missing, recalculate
    if (req.body.leaveDeduction === undefined && salary.month) {
      salary.leaveDeduction = await calculateLeaveDeduction(salary.employee, salary.month);
    }

    await salary.save();
    const populated = await Salary.findById(salary._id).populate("employee", "name employeeId department");
    res.status(200).json({ message: "Salary updated successfully", salary: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary not found" });
    res.status(200).json({ message: "Salary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSalary, getSalaries, updateSalary, deleteSalary };
