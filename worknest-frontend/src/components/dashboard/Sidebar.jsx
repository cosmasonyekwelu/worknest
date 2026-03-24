import { NavLink, Link } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "../Logo";
import Logout from "../Logout";

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Jobs", path: "/admin/jobs", icon: <Briefcase size={20} /> },
    {
      name: "Applications",
      path: "/admin/applications",
      icon: <FileText size={20} />,
    },
    // {
    //   name: "Change Password",
    //   path: "/auth/change-password",
    //   icon: <Settings size={20} />,
    // },
  ];
  return (
    <>
      <aside
        className={`fixed lg:fixed inset-y-0 left-0 z-30 w-64 bg-[var(--sidebar-color)] text-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 h-screen`}
      >
        {/* optional close button for mobile */}
        <button onClick={onClose} className="lg:hidden absolute top-4 right-4">
          x
        </button>
        {/* sidebar content */}
        <div className="w-64  border-r border-gray-200 flex flex-col h-screen">
          <div className="p-6 ">
            <Logo />
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[var(--sidebar-active-color)] font-medium text-white"
                      : "text-white hover:bg-[var(--sidebar-active-color)]"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-4 py-6 border-t border-[#6B6B6B]">
            <div className="px-4 py-3 flex items-center gap-3">
              <Settings size={20} className="" />
              <Link
                to="/admin/settings"
                className="text-sm text-white font-medium hover:text-gray-300"
              >
                Settings
              </Link>
            </div>
            <Logout />
          </div>
        </div>
      </aside>
    </>
  );
}
