import { applicationOverview } from "@/data/activities";
import CircularProgress from "./CircularProgress";

export default function ApplicationOverview() {
  return (
    <div className='bg-white rounded-lg p-5 border'>
        <h3 className='font-medium mb-6 p-3 border-b border-[#CAD3DB]'>Application Overview</h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {applicationOverview.map((item) => (
                <div 
                key={item.label}
                className="flex flex-col items-center px-5">
                    <p className="text-[14px] font-semibold text-[#525151] text-center">{item.label}</p>
                    <CircularProgress 
                     value={item.value}
                     color={item.color}
                     textColor={item.textColor}/>
                </div>
            ))}
        </div>
    </div>
  );
}


