import { activities, statusStyles } from "@/data/activities";
import { ArrowRight } from "lucide-react";

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-lg py-5 px-6 border border-[#7D7D7D]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[16px] text-[#000000]">Recent Activity</h3>
            <div className="flex items-center gap-2">
                <button className="text-sm text-[#65758B]">View All</button>
                <ArrowRight  className="text-[#65758B] w-5 h-5"/>
            </div>
        </div>

        <div className="space-y-3">
            {activities.map((item) => (
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[16px] font-semibold text-[#0F1729]">{item.title}</p>
                        <span className="text-[14px] text-[#65758B]">{item.time}</span>
                    </div>

                    <span className={`text-[14px] font-semibold px-4 py-2 h-fit ${statusStyles[item.status]}`}>
                        {item.status}
                    </span>
                </div>
            ))}
        </div>
    </div>
  );
}
