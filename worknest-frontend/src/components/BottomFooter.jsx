import { Link } from "react-router";

export default function BottomFooter() {
  return (
    <div className="flex flex-col gap-4 py-5 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
      <div className="flex flex-wrap items-center justify-center gap-4 text-[14px] text-[#FFFFFF] md:text-[18px] lg:justify-start">
        <Link to="/terms-of-service">
          <p>Terms & Conditions</p>
        </Link>
        <Link to="/privacy-policy">
          <p>Privacy & Policy</p>
        </Link>
      </div>
      <div>
        <p className="text-[14px] text-[#FFFFFF] md:text-[18px]">
          &copy; 2026 Work Nest. Crafted for the future of work.
        </p>
      </div>
    </div>
  );
}
