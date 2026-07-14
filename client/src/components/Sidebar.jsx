import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building2, ClipboardList, CalendarClock, PlaneTakeoff, BadgeDollarSign, BellRing, Settings as SettingsIcon, UserCircle2, BarChart3 } from "lucide-react";

const baseMenu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Employee"] },
  { name: "Employees", path: "/employees", icon: Users, roles: ["Admin"] },
  { name: "Departments", path: "/departments", icon: Building2, roles: ["Admin"] },
  { name: "Tasks", path: "/tasks", icon: ClipboardList, roles: ["Admin", "Employee"] },
  { name: "Attendance", path: "/attendance", icon: CalendarClock, roles: ["Admin", "Employee"] },
  { name: "Leaves", path: "/leaves", icon: PlaneTakeoff, roles: ["Admin", "Employee"] },
  { name: "Salary", path: "/salary", icon: BadgeDollarSign, roles: ["Admin", "Employee"] },
  { name: "Notifications", path: "/notifications", icon: BellRing, roles: ["Admin", "Employee"] },
  { name: "Reports", path: "/reports", icon: BarChart3, roles: ["Admin"] },
  { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["Admin"] },
  { name: "Profile", path: "/profile", icon: UserCircle2, roles: ["Admin", "Employee"] },
];

function Sidebar() {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const menu = useMemo(() => {
    return baseMenu.filter((item) => item.roles.includes(currentUser?.role || "Employee"));
  }, [currentUser?.role]);

  return (
    <aside className="w-64 min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="mb-10 text-2xl font-bold">Employee Manager</h1>
      {menu.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`mb-2 flex items-center gap-3 rounded p-3 ${active ? "bg-blue-600" : "hover:bg-slate-700"}`}
          >
            <Icon size={16} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </aside>
  );
}

export default Sidebar;