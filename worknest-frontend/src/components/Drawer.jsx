import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { profileLinks, navLink, navAuthLink } from "@/libs/constant";
import { useAuth } from "@/store";
import Avatar from "@/components/Avatar"; // Import the new Avatar component
import LogoutButton from "./Logout"; // Renamed to avoid confusion

export default function Drawer() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeDrawer = () => setOpen(false);

  // Handle logout – assumes LogoutButton calls logout internally
  // If not, we can add an onClick handler here
  const handleLogout = () => {
    logout();
    closeDrawer();
  };

  return (
    <>
      {/* Menu button – unified for both guest and user */}
      <button
        onClick={() => setOpen(true)}
        aria-label={user ? "Open profile menu" : "Open menu"}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
        aria-label="Navigation drawer"
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onClick={closeDrawer}
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 mt-8 flex flex-col h-full">
          {/* User info – only when logged in */}
          {user && (
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center gap-4 mb-2">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  alt={user.name}
                  size={48}
                />
                <p className="font-medium text-[20px] text-[#0E0E0E]">
                  {user.name}
                </p>
              </div>
              <p className="text-[16px] text-[#F89E85] font-light">
                {user.role}
              </p>
            </div>
          )}

          {/* Main navigation links – always shown */}
          <nav className="flex flex-col gap-4">
            {navLink.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `text-[18px] ${
                    isActive
                      ? "text-[#F75D1F] font-medium"
                      : "text-[#0E0E0E] hover:text-[#F75D1F]"
                  } transition-colors`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Authentication links – only when logged out */}
          {!user && (
            <div className="border-t pt-4 flex flex-col gap-3 mt-6">
              {navAuthLink.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-[18px] ${
                      isActive
                        ? "text-[#F75D1F] font-medium"
                        : "text-[#0E0E0E] hover:text-[#F75D1F]"
                    } transition-colors`
                  }
                  onClick={closeDrawer}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Account links – only when logged in */}
          {user && (
            <div className="border-t mt-6 pt-4 flex flex-col gap-2">
              {profileLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-[#F75D1F] text-white"
                          : "text-[#0E0E0E] hover:bg-[#de825a] hover:text-white"
                      }`
                    }
                  >
                    {Icon && <Icon className="w-6 h-6" />}
                    <span className="text-[18px]">{link.name}</span>
                  </NavLink>
                );
              })}

              {/* Logout button – using LogoutButton component */}
              <LogoutButton
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-3 w-full text-left rounded-md text-[#0E0E0E] hover:bg-[#de825a] hover:text-white transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-[18px]">Sign Out</span>
              </LogoutButton>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}