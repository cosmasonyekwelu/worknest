import { NavLink } from "react-router";
import Logo from "./Logo";
import { footerCompany, footerJobs } from "@/libs/constant";
import Email from "./Email";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function TopFooter() {
  return (
    <div className="pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <div>
          <div className="mb-5 w-45">
            <Logo />
          </div>
          <p className="text-[14px] md:text-[18px] text-[#000000] lg:w-50">
            A strictly curated job platform where every listing is hand-picked
            and managed by the recruiter. We value quality and transparency
            above all.
          </p>
        </div>

        <div>
          <h2 className="font-extrabold text-[16px] text-[#000000]">JOBS</h2>
          <div>
            {footerJobs.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                className="block my-4 text-[14px] md:text-[18px] text-[#000000]"
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-extrabold text-[16px] text-[#000000]">COMPANY</h2>
          <div>
            {footerCompany.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                className="block my-4 text-[14px] md:text-[18px] text-[#000000]"
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-extrabold text-[24px] text-[#000000]">
            Stay Updated
          </h2>
          <p className="text-[14px] md:text-[18px] text-[#000000] mt-3">
            Subscribe to our newsletter to get our latest news
          </p>
          <div>
            <Email />
          </div>
        </div>
      </div>
      <div className="flex justify-center space-x-4 p-7">
        <Facebook className="text-[#000000] hover:text-[#F75D1F] cursor-pointer" />
        <Instagram className="text-[#000000] hover:text-[#F75D1F] cursor-pointer" />
        <Twitter className="text-[#000000] hover:text-[#F75D1F] cursor-pointer" />
        <Youtube className="text-[#000000] hover:text-[#F75D1F] cursor-pointer" />
      </div>
    </div>
  );
}
