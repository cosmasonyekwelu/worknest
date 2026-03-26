import { NavLink } from "react-router";
import Logo from "./Logo";
import { footerCompany, footerJobs, footerSocialLinks } from "@/libs/constant";
import Email from "./Email";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function TopFooter() {
  const socialIconMap = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
  };

  return (
    <div className="pt-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="mb-5 max-w-[180px]">
            <Logo />
          </div>
          <p className="max-w-sm text-[14px] text-[#000000] md:text-[18px]">
            A strictly curated job platform where every listing is hand-picked
            and managed by the recruiter. We value quality and transparency
            above all.
          </p>
        </div>

        <div>
          <h2 className="font-extrabold text-[16px] text-[#000000]">JOBS</h2>
          <div>
            {footerJobs.map((item) => (
              item.path && !item.disabled ? (
                <NavLink
                  to={item.path}
                  key={item.name}
                  className="block my-4 text-[14px] md:text-[18px] text-[#000000] hover:text-[#F75D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F75D1F]"
                >
                  {item.name}
                </NavLink>
              ) : (
                <span
                  key={item.name}
                  className="block my-4 text-[14px] md:text-[18px] text-[#6B7280]"
                  aria-disabled="true"
                >
                  {item.name} {item.note ? `(${item.note})` : ""}
                </span>
              )
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
                className="block my-4 text-[14px] md:text-[18px] text-[#000000] hover:text-[#F75D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F75D1F]"
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
      <div className="flex flex-wrap justify-center gap-4 p-7">
        {footerSocialLinks.map((item) => {
          const Icon = socialIconMap[item.icon];
          if (!Icon) return null;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              className="rounded-full p-2 text-[#000000] transition hover:-translate-y-0.5 hover:text-[#F75D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F75D1F]"
            >
              <Icon className="h-6 w-6" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
