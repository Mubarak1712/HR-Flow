import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Clock3, Layers3, Sparkles, Users2, CheckCircle2, CircleAlert, BadgeDollarSign, BellRing, UserRound, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [dashboard, setDashboard] = useState({
    role: user?.role || "Employee",
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    highPriority: 0,
    pendingLeaves: 0,
    recentEmployees: [],
    recentTasks: [],
    assignedTasks: [],
    taskProgress: 0,
    attendance: null,
    leaveBalance: 0,
    latestSalary: null,
    notifications: [],
    profileCompletion: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      const nextUser = {
        ...(JSON.parse(localStorage.getItem("user") || "null") || {}),
        role: res.data.role || "Employee",
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      setDashboard(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const isAdmin = dashboard.role === "Admin" || user?.role === "Admin";

  const metrics = isAdmin
    ? [
        { label: "Employees", value: dashboard.totalEmployees, tone: "info", icon: Users2 },
        { label: "Tasks", value: dashboard.totalTasks, tone: "success", icon: Layers3 },
        { label: "Pending leaves", value: dashboard.pendingLeaves, tone: "warning", icon: Clock3 },
      ]
    : [
        { label: "Tasks", value: dashboard.assignedTasks?.length || 0, tone: "info", icon: ClipboardList },
        { label: "Progress", value: `${dashboard.taskProgress}%`, tone: "success", icon: CheckCircle2 },
        { label: "Leave balance", value: dashboard.leaveBalance, tone: "warning", icon: CircleAlert },
      ];

  return (
    <Layout>
      <PageShell
        title={isAdmin ? "Admin dashboard" : "Employee dashboard"}
        description={isAdmin ? "Track company-wide HR performance and operations." : "Stay on top of your workload, attendance, leaves, salary, and notifications."}
        actions={[
          <Link key="tasks" to="/tasks" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            {isAdmin ? "Review tasks" : "Open my tasks"} <ArrowRight size={16} />
          </Link>,
        ]}
      >
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-indigo-50/50 to-cyan-50/40 p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-sm font-semibold text-indigo-700">
                  <Sparkles size={14} /> Today’s pulse
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Welcome back, {user?.name || "there"}</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-500">{isAdmin ? `Your team is moving smoothly with ${dashboard.completedTasks} completed tasks and ${dashboard.inProgressTasks} currently in progress.` : `You have ${dashboard.assignedTasks?.length || 0} assigned tasks and ${dashboard.taskProgress}% task completion.`}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-900"><BriefcaseBusiness size={15} /> {isAdmin ? "Priority queue" : "Attendance"}</div>
                <p className="mt-1 text-2xl font-semibold text-rose-500">{isAdmin ? dashboard.highPriority : dashboard.attendance?.status || "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400"><CalendarDays size={15} /> Weekly focus</div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Tasks pending", value: dashboard.pendingTasks },
                { label: "High priority", value: dashboard.highPriority },
                { label: "Completed", value: dashboard.completedTasks },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map(({ label, value, tone, icon: Icon }) => (
            <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5">
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

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {isAdmin ? (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recent employees</h3>
                  <p className="text-sm text-slate-500">Freshly added team members</p>
                </div>
                <Link to="/employees" className="text-sm font-semibold text-indigo-600">View all</Link>
              </div>
              <div className="overflow-x-auto">
                {dashboard.recentEmployees.length === 0 ? (
                  <div className="p-6"><EmptyState title="No records found" description="No employee records are available yet." /></div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {dashboard.recentEmployees.map((emp) => (
                        <tr key={emp._id} className="transition hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-sm text-slate-500">{emp.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹ {emp.salary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400"><UserRound size={15} /> Your snapshot</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Attendance</span><span className="font-semibold text-slate-900">{dashboard.attendance?.status || "Not marked"}</span></div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Leave balance</span><span className="font-semibold text-slate-900">{dashboard.leaveBalance}</span></div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Salary summary</span><span className="font-semibold text-slate-900">₹ {dashboard.latestSalary?.netSalary || 0}</span></div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Profile completion</span><span className="font-semibold text-slate-900">{dashboard.profileCompletion}%</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{isAdmin ? "Recent tasks" : "Recent notifications"}</h3>
                <p className="text-sm text-slate-500">{isAdmin ? "Accountability across the team" : "Updates relevant to you"}</p>
              </div>
              <Link to={isAdmin ? "/tasks" : "/notifications"} className="text-sm font-semibold text-indigo-600">View all</Link>
            </div>
            <div className="space-y-3 p-4">
              {(isAdmin ? dashboard.recentTasks : dashboard.notifications).length === 0 ? (
                <EmptyState title="No records found" description={isAdmin ? "No recent tasks are available." : "No notifications are available."} />
              ) : (
                (isAdmin ? dashboard.recentTasks : dashboard.notifications).map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{isAdmin ? item.title : item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{isAdmin ? item.employee?.name || "Unassigned" : item.message}</p>
                      </div>
                      {isAdmin ? <StatusBadge tone={item.status === "Completed" ? "success" : item.status === "In Progress" ? "warning" : "info"}>{item.status}</StatusBadge> : <BellRing size={16} className="text-slate-400" />}
                    </div>
                    {isAdmin ? <div className="mt-3 flex items-center justify-between text-sm text-slate-500"><span>{item.priority}</span><span>{item.description}</span></div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Dashboard;