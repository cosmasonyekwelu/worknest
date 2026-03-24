import { NavLink } from "react-router";
import { useAuth } from "@/store";
import { navAuthLink } from "@/libs/constant";
import UserDropdown from "./UserDropdown";
import Drawer from "@/components/Drawer";

export default function ProfileMenu() {
  const { user } = useAuth();

  return (
    <div>
      {/* desktop public links */}
      <div className="hidden lg:flex  gap-5 items-center">
        {!user && (
          <>
            {navAuthLink.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={() => {
                  if (item.variant === "primary") {
                    return "px-6 py-2 bg-[#F85E1E] rounded-[20px] border border-[#F85E1E] text-[18px] text-[#000000] font-medium";
                  }
                  if (item.variant === "outline") {
                    return "px-6 py-2 border-2 border-[#F85E1E]  rounded-[20px] text-[18px] text-[#000000] font-medium";
                  }
                }}
              >
                {item.name}
              </NavLink>
            ))}
          </>
        )}
        {user && <UserDropdown />}
      </div>

      {/* mobile drawer */}
      <div className="lg:hidden">
        <Drawer />
      </div>
    </div>
  );
}
