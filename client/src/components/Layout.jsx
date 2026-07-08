import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, LogOut, Menu, MoonStar, Search, Sparkles, LayoutDashboard, Users, Building2, ClipboardList, CalendarClock, PlaneTakeoff, BadgeDollarSign, BellRing, Settings as SettingsIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Departments", path: "/departments", icon: Building2 },
  { name: "Tasks", path: "/tasks", icon: ClipboardList },
  { name: "Attendance", path: "/attendance", icon: CalendarClock },
  { name: "Leaves", path: "/leaves", icon: PlaneTakeoff },
  { name: "Salary", path: "/salary", icon: BadgeDollarSign },
  { name: "Notifications", path: "/notifications", icon: BellRing },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle = useMemo(() => {
    return menu.find((item) => item.path === location.pathname)?.name || "Workspace";
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="flex min-h-screen">
        <aside className={`border-r border-slate-200 bg-white/90 px-4 py-6 shadow-[8px_0_30px_rgba(15,23,42,0.03)] transition-all duration-300 ${collapsed ? "w-24" : "w-72"}`}>
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg font-semibold text-white shadow-lg shadow-indigo-200">E</div>
              {!collapsed ? (
                <div>
                  <p className="text-lg font-semibold text-slate-900">Northstar</p>
                  <p className="text-sm text-slate-500">HR Workspace</p>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
              <Menu size={18} />
            </button>
          </div>

          <div className={`mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 ${collapsed ? "hidden" : "block"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Sparkles size={13} />
              <span>Quick search</span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              <Search size={14} />
              <span>Search</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}><Icon size={16} /></span>
                  {!collapsed ? <span>{item.name}</span> : null}
                  {active ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-indigo-600" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className={`mt-8 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 ${collapsed ? "hidden" : "block"}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-semibold text-white">AK</div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Alicia Kim</p>
                <p className="text-xs text-slate-500">Operations Lead</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-500">
              <span>Workstream</span>
              <span className="font-semibold text-slate-900">Premium</span>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Workspace</span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-slate-700">{currentTitle}</span>
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{currentTitle}</h2>
              </div>

              <div className="flex items-center gap-3">
                <label className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search size={14} />
                  <input className="w-40 bg-transparent outline-none" placeholder="Search" />
                </label>
                <button type="button" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50">
                  <Bell size={18} />
                </button>
                <button type="button" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50">
                  <MoonStar size={18} />
                </button>
                <button type="button" onClick={logout} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;