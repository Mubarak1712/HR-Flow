const Employee = require("../models/Employee");
const User = require("../models/User");

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.department) {
      payload.department = "General";
    }

    if (!payload.role) {
      payload.role = "Employee";
    }

    const employee = await Employee.create(payload);

    if (payload.createLogin && payload.password) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const user = await User.create({
        name: employee.name,
        email: employee.email,
        password: hashedPassword,
        role: employee.role || "Employee",
        employee: employee._id,
      });
      employee.user = user._id;
      await employee.save();
    }

    res.status(201).json({
      message: "Employee Created Successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("manager", "name employeeId");

    res.status(200).json({
      message: "Employees Fetched Successfully",
      employees,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Employee
const getEmployeeById = async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      const ownEmployeeId = req.user.employee?.toString();
      const ownEmployee = await Employee.findOne({ email: req.user.email });
      const allowedId = ownEmployeeId || ownEmployee?._id?.toString();

      if (allowedId !== req.params.id) {
        return res.status(403).json({ message: "You can only access your own profile" });
      }
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee Not Found",
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (req.user.role === "Employee") {
      const ownEmployee = await Employee.findOne({ email: req.user.email });
      const allowedId = req.user.employee?.toString() || ownEmployee?._id?.toString();

      if (allowedId !== req.params.id) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }

      delete updatePayload.salary;
      delete updatePayload.role;
      delete updatePayload.leaveBalance;
      delete updatePayload.status;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee Not Found",
      });
    }

    res.status(200).json({
      message: "Employee Updated Successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee Not Found",
      });
    }

    res.status(200).json({
      message: "Employee Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
