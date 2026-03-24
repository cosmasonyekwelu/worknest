import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import Logout from "../Logout";
import { useAuth } from "@/store";
import NotificationsMenu from "@/components/dashboard/NotificationsMenu";
import Avatar from "@/components/Avatar"; // Import Avatar component

export default function AdminTopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* mobile menu */}
        <button onClick={onMenuClick} className="lg:hidden">
          <Menu size={20} />
        </button>
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-md w-72 border-[0.5px] shadow-xl">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="text-sm w-full outline-none"
          />
        </div>
      </div>
      {/* Right actions */}
      <div className="flex items-center gap-6">
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
              size={56}
              className="w-14 h-14 rounded-full object-cover"
            />
            <span className="text-[18px] text-[#000000] font-medium">
              {user?.fullname}
            </span>
            <ChevronDown size={16} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow mt-4"
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