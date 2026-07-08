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
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/database");
const app = express();
const PORT=process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Employee Task Manager Backend is running");
});
connectDB();
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

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});