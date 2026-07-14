const Employee = require("../models/Employee");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getEmployeeForUser } = require("../utils/hrmsHelpers");

// Create Employee
const createEmployee = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    console.log("createEmployee payload", payload);

    if (!payload.department) {
      payload.department = "General";
    }

    if (!payload.role) {
      payload.role = "Employee";
    }

    const existingEmployee = await Employee.findOne({ email: payload.email });
    if (existingEmployee) {
      return res.status(400).json({ message: "An employee with this email already exists" });
    }

    console.log("creating employee document");
    const employee = await Employee.create(payload);
    console.log("employee created", employee._id.toString());

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

    console.log("creating notification");
    await Notification.create({
      employee: employee._id,
      title: "Profile Created",
      message: `Welcome ${employee.name}! Your employee profile has been created.`,
      type: "General",
    });

    res.status(201).json({
      message: "Employee Created Successfully",
      employee,
    });
  } catch (error) {
    console.error("createEmployee error", error);
    next(error);
  }
};

// Get All Employees
const getEmployees = async (req, res) => {
  try {
    const { search = "", department = "All", status = "All" } = req.query;
    const filter = {};

    if (req.user.role === "Employee") {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }
      filter._id = employee._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "All") {
      filter.department = department;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    const employees = await Employee.find(filter)
      .populate("manager", "name employeeId")
      .sort({ createdAt: -1 });

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
      delete updatePayload.email;
    }

    if (updatePayload.email) {
      const existingEmployee = await Employee.findOne({ email: updatePayload.email, _id: { $ne: req.params.id } });
      if (existingEmployee) {
        return res.status(400).json({ message: "An employee with this email already exists" });
      }
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

    if (req.user.role !== "Employee") {
      await Notification.create({
        employee: employee._id,
        title: "Profile Updated",
        message: `Your profile was updated by ${req.user.name}.`,
        type: "Profile Updated",
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

    await User.deleteMany({ employee: employee._id });
    await Notification.deleteMany({ employee: employee._id });

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
