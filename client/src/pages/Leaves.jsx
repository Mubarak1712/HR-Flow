import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Sparkles, Umbrella } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Leaves() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: "", leaveType: "Casual", reason: "", startDate: "", endDate: "" });

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data.leaves || []);
    } catch {
      toast.error("Failed to load leaves");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLeaves();
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
      const payload = { ...form };
      if (user?.role !== "Admin") delete payload.employee;
      await api.post("/leaves", payload);
      toast.success("Leave request submitted");
      setForm({ employee: "", leaveType: "Casual", reason: "", startDate: "", endDate: "" });
      await fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit leave");
    }
  };

  const approvedCount = leaves.filter((item) => item.status === "Approved").length;
  const pendingCount = leaves.filter((item) => item.status === "Pending").length;

  const handleReview = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave ${status === "Approved" ? "approved" : "rejected"}`);
      await fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || `Unable to ${status.toLowerCase()} leave`);
    }
  };

  return (
    <Layout>
      <PageShell title="Leave requests" description="Designed to feel calm, thoughtful, and premium for time-off management.">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-amber-50/40 p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600"><Umbrella size={18} /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Submit leave</h2>
                  <p className="text-sm text-slate-500">Keep approvals structured and transparent.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                {user?.role === "Admin" ? (
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required>
                    <option value="">Select employee</option>
                    {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                  </select>
                ) : null}
                <select name="leaveType" value={form.leaveType} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400">
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required />
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required />
                </div>
                <textarea name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" rows="3" required />
                <button className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">Submit leave request</button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles size={15} /> Approved</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{approvedCount}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} /> Pending</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <TableShell title="Leave history" subtitle="Recent time-off requests and approvals.">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {leaves.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500"><EmptyState title="No records found" description="No leave requests are available." /></td></tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{leave.employee?.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{leave.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{leave.reason}</td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <StatusBadge tone={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "danger" : "warning"}>{leave.status}</StatusBadge>
                        {user?.role === "Admin" && leave.status === "Pending" ? (
                          <div className="ml-2 flex gap-2">
                            <button onClick={() => void handleReview(leave._id, "Approved") } className="rounded px-3 py-1 bg-green-600 text-white text-sm">Approve</button>
                            <button onClick={() => void handleReview(leave._id, "Rejected") } className="rounded px-3 py-1 bg-red-600 text-white text-sm">Reject</button>
                          </div>
                        ) : null}
                      </td>
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

export default Leaves;
