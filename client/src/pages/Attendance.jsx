import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock3 } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Attendance() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const today = new Date().toISOString().slice(0, 10);
  const [records, setRecords] = useState([]);
  const [reports, setReports] = useState({ summary: { totalCount: 0, presentCount: 0, lateCount: 0, absentCount: 0, onTimeRate: 0 }, records: [] });
  const [employees, setEmployees] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [form, setForm] = useState({ employee: "", date: today, checkIn: "", checkOut: "", status: "Present" });

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance");
      setRecords(res.data.attendance || []);
    } catch {
      toast.error("Failed to load attendance");
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

  const fetchReports = async () => {
    try {
      const res = await api.get("/attendance/reports");
      setReports(res.data || { summary: { totalCount: 0, presentCount: 0, lateCount: 0, absentCount: 0, onTimeRate: 0 }, records: [] });
    } catch {
      toast.error("Failed to load attendance reports");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAttendance();
      void fetchEmployees();
      void fetchReports();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        date: form.date || today,
        checkIn: form.checkIn || "",
        checkOut: form.checkOut || "",
      };
      if (user?.role !== "Admin") delete payload.employee;
      await api.post("/attendance", payload);
      toast.success("Attendance saved");
      setForm({ employee: "", date: today, checkIn: "", checkOut: "", status: "Present" });
      await fetchAttendance();
      await fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save attendance");
    }
  };

  const handleClockAction = async (mode) => {
    try {
      setLoadingAction(true);
      const payload = {
        date: form.date || today,
        ...(mode === "in" ? { checkIn: new Date().toTimeString().slice(0, 5) } : { checkOut: new Date().toTimeString().slice(0, 5) }),
      };

      if (user?.role === "Admin" && form.employee) {
        payload.employee = form.employee;
      }

      await api.post(`/attendance/clock-${mode}`, payload);
      toast.success(`Clock ${mode === "in" ? "in" : "out"} recorded`);
      await fetchAttendance();
      await fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || `Unable to clock ${mode === "in" ? "in" : "out"}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const summary = reports.summary || { totalCount: 0, presentCount: 0, lateCount: 0, absentCount: 0, onTimeRate: 0 };
  const presentCount = summary.presentCount ?? records.filter((record) => record.status === "Present").length;
  const lateCount = summary.lateCount ?? records.filter((record) => record.status === "Late").length;

  return (
    <Layout>
      <PageShell title="Attendance" description="A polished view that blends daily logs, punctuality insights, and team rhythm.">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Clock3 size={18} /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Daily attendance</h2>
                  <p className="text-sm text-slate-500">Capture presence with clarity and consistency.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => void handleClockAction("in")} disabled={loadingAction} className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">Clock In</button>
                <button type="button" onClick={() => void handleClockAction("out")} disabled={loadingAction} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70">Clock Out</button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                {user?.role === "Admin" ? (
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required>
                    <option value="">Select employee</option>
                    {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                  </select>
                ) : null}
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="time" name="checkIn" value={form.checkIn} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" />
                  <input type="time" name="checkOut" value={form.checkOut} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400" />
                </div>
                <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
                <button className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">Save attendance</button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Present</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{presentCount}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Late</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">{lateCount}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Tracked</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600"><CalendarDays size={18} /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Weekly rhythm</h2>
                  <p className="text-sm text-slate-500">A calm, premium view of attendance movement.</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>On-time arrivals</span>
                  <span className="font-semibold text-slate-900">{summary.onTimeRate}%</span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-slate-200">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500" style={{ width: `${summary.onTimeRate}%` }} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Absent: {summary.absentCount}</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Records: {summary.totalCount}</div>
                </div>
              </div>
            </div>

            <TableShell title="Attendance log" subtitle="Latest attendance records and outcomes.">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {records.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500"><EmptyState title="No records found" description="No attendance records are available yet." /></td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record._id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{record.employee?.name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><StatusBadge tone={record.status === "Present" ? "success" : record.status === "Late" ? "warning" : "danger"}>{record.status}</StatusBadge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableShell>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Attendance;
