const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "Smart HRMS",
    },
    workingHours: {
      type: Number,
      default: 8,
    },
    monthlyLeaveLimit: {
      type: Number,
      default: 2,
    },
    salaryDeductionPerExtraLeave: {
      type: Number,
      default: 1000,
    },
    theme: {
      type: String,
      enum: ["Light", "Dark", "System"],
      default: "Light",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
