const assert = require("assert");
const salaryController = require("../controllers/salaryController");
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");
const Notification = require("../models/Notification");

(async () => {
  const originalFindById = Employee.findById;
  const originalCreate = Salary.create;
  const originalNotificationCreate = Notification.create;

  try {
    Employee.findById = async () => ({ _id: "emp_1", salary: 5000 });
    Salary.create = async (payload) => ({
      ...payload,
      populate: async () => ({
        ...payload,
        employee: { name: "Test Employee", employeeId: "E-001", department: "Engineering" },
      }),
    });
    Notification.create = async () => ({ ok: true });

    const req = { body: { employee: "emp_1", baseSalary: "5000", bonus: "500" } };
    const res = {
      statusCode: null,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.payload = body;
        return this;
      },
    };

    await salaryController.createSalary(req, res);
    assert.strictEqual(res.statusCode, 400, "missing month should return 400");
    console.log("✓ createSalary rejects missing month");
  } catch (error) {
    console.error("✗ salaryController test failed", error);
    process.exit(1);
  } finally {
    Employee.findById = originalFindById;
    Salary.create = originalCreate;
    Notification.create = originalNotificationCreate;
  }
})();
