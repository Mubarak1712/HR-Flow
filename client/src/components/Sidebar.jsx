import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Employees", path: "/employees" },
    { name: "Tasks", path: "/tasks" },
    { name: "Departments", path: "/departments" },
    { name: "Attendance", path: "/attendance" },
    { name: "Leaves", path: "/leaves" },
    { name: "Salary", path: "/salary" },
    { name: "Notifications", path: "/notifications" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">
        Employee Manager
      </h1>

      {menu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`block p-3 rounded mb-2 ${
            location.pathname === item.path
              ? "bg-blue-600"
              : "hover:bg-slate-700"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;