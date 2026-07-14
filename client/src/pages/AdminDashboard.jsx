import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, BadgeDollarSign, BriefcaseBusiness, CalendarDays, ClipboardList, Clock3, Layers3, Sparkles, Users2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import PageShell from "../components/PageShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    role: "Admin",
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    pendingLeaves: 0,
    todaysAttendance: 0,
    pendingTasks: 0,
    payrollSummary: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard({
        role: res.data.role || "Admin",
        totalEmployees: res.data.totalEmployees || 0,
        activeEmployees: res.data.activeEmployees || 0,
        departments: res.data.departments || 0,
        pendingLeaves: res.data.pendingLeaves || 0,
        todaysAttendance: res.data.todaysAttendance || 0,
        pendingTasks: res.data.pendingTasks || 0,
        payrollSummary: res.data.payrollSummary || 0,
        recentActivities: res.data.recentActivities || [],
      });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  const metrics = useMemo(() => [
    { label: "Total Employees", value: dashboard.totalEmployees, icon: Users2, tone: "info" },
    { label: "Active Employees", value: dashboard.activeEmployees, icon: BriefcaseBusiness, tone: "success" },
    { label: "Departments", value: dashboard.departments, icon: Layers3, tone: "warning" },
    { label: "Pending Leaves", value: dashboard.pendingLeaves, icon: Clock3, tone: "warning" },
    { label: "Today's Attendance", value: dashboard.todaysAttendance, icon: CalendarDays, tone: "info" },
    { label: "Pending Tasks", value: dashboard.pendingTasks, icon: ClipboardList, tone: "success" },
  ], [dashboard]);

  return (
    <AdminLayout>
      <PageShell
        title="Admin dashboard"
        description="Operational overview for the company with live data from MongoDB."
        actions={[
          <Link key="employees" to="/employees" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            Review employees <ArrowRight size={16} />
          </Link>,
        ]}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{loading ? "—" : value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${tone === "info" ? "bg-sky-50 text-sky-600" : tone === "success" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400"><BadgeDollarSign size={15} /> Payroll summary</div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Current payroll total</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">₹ {loading ? "—" : dashboard.payrollSummary}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400"><Sparkles size={15} /> Recent activities</div>
            <div className="mt-4 space-y-3">
              {dashboard.recentActivities.length === 0 ? (
                <EmptyState title="No activity yet" description="Recent admin activity will appear here." />
              ) : (
                dashboard.recentActivities.map((item) => (
                  <div key={item._id || item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PageShell>
    </AdminLayout>
  );
}

export default AdminDashboard;
