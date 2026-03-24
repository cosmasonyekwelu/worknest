import { createElement, isValidElement, cloneElement } from "react";

export default function StatsCard({ label, value, icon, color }) {
  const iconElement = isValidElement(icon)
    ? cloneElement(icon, { size: icon.props?.size ?? 20 })
    : icon
      ? createElement(icon, { size: 20 })
      : null;

  return (
    <div className="bg-white rounded-[5px] py-7 px-4 border border-[#7D7D7D]">
      <div className={`p-2 w-9 h-9 rounded-md ${color}`}>{iconElement}</div>
      <h2 className="text-[22px] font-semibold mt-4 text-[#0F1729]">{value}</h2>
      <p className="text-[14px] text-[#65748B]">{label}</p>
    </div>
    
  );
}

