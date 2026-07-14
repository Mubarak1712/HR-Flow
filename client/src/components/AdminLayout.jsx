import Layout from "./Layout";
import { LayoutDashboard, Users, Building2, ClipboardList, CalendarClock, PlaneTakeoff, BadgeDollarSign, BarChart3, BellRing, Settings as SettingsIcon, UserCircle2 } from "lucide-react";

const adminMenu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ["Admin"] },
  { name: "Employees", path: "/employees", icon: Users, roles: ["Admin"] },
  { name: "Departments", path: "/departments", icon: Building2, roles: ["Admin"] },
  { name: "Tasks", path: "/tasks", icon: ClipboardList, roles: ["Admin"] },
  { name: "Attendance", path: "/attendance", icon: CalendarClock, roles: ["Admin"] },
  { name: "Leave Requests", path: "/leaves", icon: PlaneTakeoff, roles: ["Admin"] },
  { name: "Salary", path: "/salary", icon: BadgeDollarSign, roles: ["Admin"] },
  { name: "Reports", path: "/reports", icon: BarChart3, roles: ["Admin"] },
  { name: "Notifications", path: "/notifications", icon: BellRing, roles: ["Admin"] },
  { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["Admin"] },
  { name: "Profile", path: "/profile", icon: UserCircle2, roles: ["Admin"] },
];

function AdminLayout({ children }) {
  return <Layout menuItems={adminMenu}>{children}</Layout>;
}

export default AdminLayout;
