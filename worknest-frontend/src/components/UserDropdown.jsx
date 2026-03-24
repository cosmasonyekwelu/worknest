import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { profileLinks } from "@/libs/constant";
import { useAuth } from "@/store";
import { ChevronDown, LogOut } from "lucide-react";
import Avatar from "@/components/Avatar"; // Import the new Avatar component
import LogoutButton from "./Logout"; // Renamed to avoid confusion, adjust if needed

export default function UserDropdown() {
  const { user, logout } = useAuth(); // Ensure logout is available from useAuth
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const closeDropdown = () => setOpen(false);

  const handleLogout = () => {
    if (logout) logout();
    closeDropdown();
  };

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Avatar with fallback initials */}
      <Avatar
        src={user?.avatar}
        name={user?.fullname || user?.name || "User"}
        alt={user?.fullname || "User avatar"}
        size={56} // w-14 = 56px
        className="w-14 h-14 rounded-full object-cover"
      />
      
      <span className="text-[18px] text-[#000000] font-medium">
        {user?.fullname || user?.name}
      </span>

      <button
        type="button"
        aria-label="Open profile menu"
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-expanded={open}
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""} text-black w-6 h-6`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-56 bg-white px-3 py-4 rounded-[10px] shadow-lg z-50">
          {/* User info */}
          <div className="py-3 border-b-[0.5px] border-[#A0A0A0]">
            <p className="font-semibold text-[#0E0E0E] text-[18px]">
              {user?.fullname || user?.name}
            </p>
            <p className="font-light text-[14px] text-[#F85E1E]">
              {user?.role}
            </p>
          </div>

          {/* Profile Links */}
          <div className="mt-2">
            {profileLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeDropdown}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-[#F85E1E] text-white"
                        : "text-[#0E0E0E] hover:bg-[#de825a] hover:text-white"
                    }`
                  }
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="text-[16px]">{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="mt-2 pt-2 border-t border-[#A0A0A0]">
            <LogoutButton
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[#0E0E0E] hover:bg-[#de825a] hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[16px]">Sign Out</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
}