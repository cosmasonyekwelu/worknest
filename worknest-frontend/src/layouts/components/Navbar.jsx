import React from "react";
import { NavLink } from "react-router";
import { navLink } from "@/libs/constant";
import Logo from "@/components/Logo";
import ProfileMenu from "@/components/ProfileMenu";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 w-full shadow z-50 bg-white ">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Logo />
      
          <div className="hidden lg:flex gap-5 items-center">
            {navLink.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `text-[18px] transition-colors duration-200 ${isActive ? "text-[#F75D1F]" : "text-[#000000] hover:text-[#F75D1F]"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div>
            <ProfileMenu />
          </div>
        </div>
      </nav>
    </>
  );
}
