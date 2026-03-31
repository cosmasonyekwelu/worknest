import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import Logout from "../Logout";
import { useAuth } from "@/store";
import NotificationsMenu from "@/components/dashboard/NotificationsMenu";
import Avatar from "@/components/Avatar"; // Import Avatar component

export default function AdminTopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between gap-3 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {/* mobile menu */}
        <button onClick={onMenuClick} className="lg:hidden">
          <Menu size={20} />
        </button>
        {/* Search */}
        <div className="hidden items-center gap-2 rounded-md border-[0.5px] px-4 py-2 shadow-xl sm:flex sm:w-full sm:max-w-xs">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="text-sm w-full outline-none"
          />
        </div>
      </div>
      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <NotificationsMenu />
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-2 cursor-pointer"
          >
            {/* Replaced conditional img/div with Avatar component */}
            <Avatar
              src={user?.avatar}
              name={user?.fullname}
              alt={user?.fullname || "User avatar"}
              size={40}
              className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
            />
            <span className="hidden max-w-[140px] truncate text-[16px] font-medium text-[#000000] md:block">
              {user?.fullname}
            </span>
            <ChevronDown size={16} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-1 mt-4 w-52 p-2 shadow"
          >
            <li>
              <Link to="/admin/settings">Change Password</Link>
            </li>
            <li>
              <Logout className="w-full text-left">Sign Out</Logout>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
