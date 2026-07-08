const Employee = require("../models/Employee");
const Setting = require("../models/Setting");

const getEmployeeForUser = async (user) => {
  if (user.employee) {
    return Employee.findById(user.employee);
  }

  return Employee.findOne({ email: user.email });
};

const getSettings = async () => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({});
  }

  return settings;
};

const countLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);

  return Math.max(Math.floor(diff / 86400000) + 1, 1);
};

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);

  return { start, end };
};

module.exports = {
  getEmployeeForUser,
  getSettings,
  countLeaveDays,
  getMonthRange,
};
