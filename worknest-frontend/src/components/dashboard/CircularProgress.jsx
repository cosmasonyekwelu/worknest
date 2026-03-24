import React from 'react'

export default function CircularProgress({ value, color, textColor}) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
  return (
    <div className='relative w-40 h-40'>
        <svg 
        className='w-full h-full rotate-90'
        viewBox='0 0 100 100'>
            {/* background circle */}
            <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="5"
            className='stroke-gray-200'
            fill='none'/>
            {/* progress circle */}
            <circle 
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="5"
            className={`${color}`}
            fill='none'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'/>
        </svg>

        {/* center text */}
        <div className='absolute inset-0 flex items-center justify-center'>
            <span className={`text-lg font-semibold ${textColor}`}>
                {value}%
            </span>
        </div>
    </div>
  )
}
