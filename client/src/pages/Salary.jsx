import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeDollarSign, CircleDollarSign, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import TableShell from "../components/TableShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: "", month: "", baseSalary: "", bonus: "", allowance: "", tax: "" });

  const fetchSalaries = async () => {
    try {
      const res = await api.get("/salary");
      setSalaries(res.data.salaries || []);
    } catch {
      toast.error("Failed to load salary records");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees?status=Active");
      const activeEmployees = (res.data.employees || []).filter((emp) => {
        const status = emp.status?.toLowerCase?.() || "";
        return status === "active" || status === "";
      });
      setEmployees(activeEmployees);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSalaries();
      void fetchEmployees();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        baseSalary: Number(form.baseSalary || 0),
        bonus: Number(form.bonus || 0),
        allowance: Number(form.allowance || 0),
        tax: Number(form.tax || 0),
      };
      await api.post("/salary", payload);
      toast.success("Salary generated");
      setForm({ employee: "", month: "", baseSalary: "", bonus: "", allowance: "", tax: "" });
      await fetchSalaries();
      await fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to generate salary");
    }
  };

  const totalNet = salaries.reduce((sum, item) => sum + Number(item.netSalary || 0), 0);

  return (
    <Layout>
      <PageShell title="Salary management" description="Premium payroll presentation with clear compensation structure and payment history.">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CircleDollarSign size={18} /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Generate pay record</h2>
                  <p className="text-sm text-slate-500">Capture base pay, bonuses, and deductions in one polished flow.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <select name="employee" value={form.employee} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required>
                  <option value="">Select employee</option>
                  {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                </select>
                <input type="month" name="month" value={form.month} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="number" name="baseSalary" placeholder="Base salary" value={form.baseSalary} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" min="0" />
                  <input type="number" name="bonus" placeholder="Bonus" value={form.bonus} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" min="0" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="number" name="allowance" placeholder="Allowance" value={form.allowance} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" min="0" />
                  <input type="number" name="tax" placeholder="Tax" value={form.tax} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" min="0" />
                </div>
                <button className="rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">Generate salary</button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500"><BadgeDollarSign size={15} /> Total payroll</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">₹ {totalNet}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles size={15} /> Records</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{salaries.length}</p>
              </div>
            </div>
          </div>

          <TableShell title="Payroll history" subtitle="Monthly compensation records at a glance.">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Net salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {salaries.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500"><EmptyState title="No records found" description="No salary records are available yet." /></td></tr>
                ) : (
                  salaries.map((salary) => (
                    <tr key={salary._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{salary.employee?.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{salary.month}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹ {salary.netSalary}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Salary;
