import { NavLink } from "react-router";

export default function Logo() {
      const isAdminAuth = location.pathname.startsWith("/admin");
  return (
    <>
      <NavLink to={isAdminAuth ? "/" : "/"}>
        <img src="/Newlogo.png" alt="logo" className="lg:w-fit h-10 md:w-40" />
      </NavLink>
    </>
  );
      
}

