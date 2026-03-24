import React from "react";
import { NavLink } from "react-router";
import { navLink } from "@/libs/constant";
import Logo from "@/components/Logo";
import ProfileMenu from "@/components/ProfileMenu";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Logo />
      
          <div className="hidden items-center gap-4 lg:flex xl:gap-6">
            {navLink.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `text-base transition-colors duration-200 xl:text-[18px] ${isActive ? "text-[#F75D1F]" : "text-[#000000] hover:text-[#F75D1F]"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="shrink-0">
            <ProfileMenu />
          </div>
        </div>
      </nav>
    </>
  );
}
