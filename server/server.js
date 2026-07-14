const path = require("path");
const taskRoutes = require("./routes/taskRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboardRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const User = require("./models/User");
const Employee = require("./models/Employee");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/database");
const app = express();
const PORT=process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get("/", (req, res) => {
    res.send("Employee Task Manager Backend is running");
});

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@company.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const existingAdmin = await User.findOne({ role: "Admin" });
    const existingTargetAdmin = await User.findOne({ email: adminEmail });

    let adminUser = existingTargetAdmin || existingAdmin;

    if (adminUser) {
      adminUser.email = adminEmail;
      adminUser.name = adminUser.name || "Administrator";
      adminUser.role = "Admin";
      adminUser.status = "Active";
      if (!adminUser.password || adminUser.password !== adminPassword) {
        adminUser.password = await bcrypt.hash(adminPassword, 10);
      }
      await adminUser.save();

      let adminEmployee = await Employee.findOne({ email: adminEmail });
      if (!adminEmployee) {
        adminEmployee = await Employee.create({
          name: adminUser.name,
          email: adminEmail,
          department: "Administration",
          position: "Administrator",
          designation: "Administrator",
          role: "Admin",
          salary: 0,
          user: adminUser._id,
        });
      }

      adminUser.employee = adminEmployee._id;
      await adminUser.save();
      console.log(`✅ Admin account ready for ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const createdAdmin = await User.create({
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    });

    const adminEmployee = await Employee.create({
      name: createdAdmin.name,
      email: adminEmail,
      department: "Administration",
      position: "Administrator",
      designation: "Administrator",
      role: "Admin",
      salary: 0,
      user: createdAdmin._id,
    });

    createdAdmin.employee = adminEmployee._id;
    await createdAdmin.save();

    console.log(`✅ Default admin account created for ${adminEmail}`);
  } catch (error) {
    console.error("Admin seed failed", error.message);
  }
};

connectDB().then(async () => {
  await seedDefaultAdmin();
  app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
console.log("Mounted reports route at /api/reports");

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
});