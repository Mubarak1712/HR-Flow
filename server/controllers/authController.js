const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && role === "Admin") {
      return res.status(403).json({ message: "Employees cannot register as Admin" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Employee",
      status: "Active",
    });

    let employee = await Employee.findOne({ email });
    if (!employee) {
      employee = await Employee.create({
        name,
        email,
        department: "General",
        position: "Employee",
        designation: "Employee",
        role: "Employee",
        user: user._id,
      });
    }

    user.employee = employee._id;
    await user.save();

    res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createAdminUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admins can create admin accounts" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    });

    let employee = await Employee.findOne({ email });
    if (!employee) {
      employee = await Employee.create({
        name,
        email,
        department: "Administration",
        position: "Administrator",
        designation: "Administrator",
        role: "Admin",
        user: user._id,
      });
    }

    user.employee = employee._id;
    await user.save();

    res.status(201).json({
      message: "Admin account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        employee: user.employee,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    let employee = null;

    if (user?.employee) {
      employee = await Employee.findById(user.employee);
    } else if (user?.email) {
      employee = await Employee.findOne({ email: user.email });
    }

    res.status(200).json({
      ...user.toObject(),
      ...(employee
        ? {
            phone: employee.phone,
            address: employee.address,
            department: employee.department,
            position: employee.position,
            profilePhoto: employee.profilePhoto,
            employeeId: employee.employeeId,
            employeeRecordId: employee._id,
          }
        : {}),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiresAt = otpExpiresAt;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetPasswordOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  createAdminUser,
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
