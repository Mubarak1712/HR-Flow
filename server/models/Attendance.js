const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: Date,
    checkOut: Date,
    workingHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      default: "Present",
    },
  },
  { timestamps: true }
);

attendanceSchema.pre("save", function () {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut.getTime() - this.checkIn.getTime();
    this.workingHours = Math.max(Number((diff / 3600000).toFixed(2)), 0);
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
