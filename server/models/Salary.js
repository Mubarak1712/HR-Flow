const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    leaveDeduction: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

salarySchema.pre("validate", function () {
  this.netSalary =
    Number(this.baseSalary || 0) +
    Number(this.bonus || 0) +
    Number(this.allowance || 0) -
    Number(this.tax || 0) -
    Number(this.leaveDeduction || 0);
});

module.exports = mongoose.model("Salary", salarySchema);
