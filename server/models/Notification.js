const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "Task Assigned",
        "Leave Approved",
        "Leave Rejected",
        "Salary Generated",
        "Deadline Tomorrow",
        "Profile Updated",
        "General",
      ],
      default: "General",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
