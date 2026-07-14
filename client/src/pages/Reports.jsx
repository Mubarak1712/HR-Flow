import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, FileDown, LayoutGrid, TrendingUp, Users2, ClipboardList, CalendarClock, BadgeDollarSign, PlaneTakeoff } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

const rangeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function Reports() {
  const [range, setRange] = useState("monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports?range=${range}`);
        setData(res.data);
      } catch (error) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    void fetchReports();
  }, [range]);

  const summaryCards = useMemo(() => {
    if (!data?.summary) return [];
    return [
      { label: "Employees", value: data.summary.totalEmployees, icon: Users2, tone: "sky" },
      { label: "Active staff", value: data.summary.activeEmployees, icon: TrendingUp, tone: "emerald" },
      { label: "Tasks", value: data.summary.totalTasks, icon: ClipboardList, tone: "violet" },
      { label: "Attendance", value: `${data.summary.attendancePercentage}%`, icon: CalendarClock, tone: "amber" },
      { label: "Leaves", value: data.summary.pendingLeaveRequests, icon: PlaneTakeoff, tone: "rose" },
      { label: "Payroll", value: `₹ ${data.summary.totalPayroll.toLocaleString()}`, icon: BadgeDollarSign, tone: "indigo" },
    ];
  }, [data]);

  const handleExport = () => {
    if (!data?.summary) return;

    const rows = [
      ["Metric", "Value"],
      ["Total Employees", data.summary.totalEmployees],
      ["Active Employees", data.summary.activeEmployees],
      ["Total Departments", data.summary.totalDepartments],
      ["Total Tasks", data.summary.totalTasks],
      ["Completed Tasks", data.summary.completedTasks],
      ["Pending Tasks", data.summary.pendingTasks],
      ["Attendance %", `${data.summary.attendancePercentage}%`],
      ["Approved Leaves", data.summary.approvedLeaves],
      ["Pending Leaves", data.summary.pendingLeaveRequests],
      ["Total Payroll", `₹ ${data.summary.totalPayroll.toLocaleString()}`],
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hr-reports-${range}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderBarChart = (series, title) => {
    if (!series?.length) {
      return <EmptyState title="No chart data" description="No data is available for the selected period." />;
    }

    const maxValue = Math.max(...series.map((item) => item.value || 0), 1);

    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BarChart3 size={16} /> Trend
          </div>
        </div>
        <div className="flex h-48 items-end gap-3">
          {series.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end rounded-2xl bg-slate-100 p-2">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-indigo-600 to-cyan-500"
                  style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
                />
              </div>
              <div className="text-center text-xs font-medium text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <PageShell
        title="Reports"
        description="Monitor HR performance with live summaries, trends, and operational insights."
        actions={[
          <button key="export" type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
            <FileDown size={16} /> Export
          </button>,
        ]}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <LayoutGrid size={16} /> Report range
          </div>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-full px-3 py-2 text-sm font-medium ${range === option.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading reports…</div>
        ) : !data?.hasData ? (
          <EmptyState title="No report data yet" description="Create employees, tasks, attendance, leaves, or payroll entries to populate this view." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                    </div>
                    <div className={`rounded-2xl p-3 ${tone === "sky" ? "bg-sky-50 text-sky-600" : tone === "emerald" ? "bg-emerald-50 text-emerald-600" : tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "amber" ? "bg-amber-50 text-amber-600" : tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {renderBarChart(data?.charts?.employeeGrowth, "Employee growth")}
              {renderBarChart(data?.charts?.taskStatus, "Task progress")}
              {renderBarChart(data?.charts?.attendanceTrend, "Attendance trend")}
              {renderBarChart(data?.charts?.payrollSummary, "Payroll trend")}
            </div>
          </>
        )}
      </PageShell>
    </Layout>
  );
}

export default Reports;
