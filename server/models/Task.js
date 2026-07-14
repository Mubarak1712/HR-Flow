const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    deadline: Date,
    estimatedHours: {
      type: Number,
      default: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: "",
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        author: {
          type: String,
          default: "System",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    completedDate: Date,
  },
  {
    timestamps: true,
  }
);

taskSchema.pre("validate", function () {
  if (!this.assignedTo && this.employee) {
    this.assignedTo = this.employee;
  }

  if (!this.employee && this.assignedTo) {
    this.employee = this.assignedTo;
  }

  if (this.status === "Completed" && !this.completedDate) {
    this.completedDate = new Date();
  }
});

module.exports = mongoose.model("Task", taskSchema);
