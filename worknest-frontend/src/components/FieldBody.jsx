import { Eye, EyeOffIcon } from 'lucide-react';
import React, { useState } from 'react'

export default function FieldBody({
    fieldName,
    label,
    type = "text",
    placeholder,
    register,
    errors,
    isSubmitting,
    className,
    options = [],
}) 
{
      const [isVisible, setIsVisible] = useState(false);

    //   if the type is password we can toggle visibility
    const inputType = type === "password" ? (isVisible ? "text" : "password") : type;


  return (
    <div className='col-span-6 sm:col-span-3 mt-3'>
    <fieldset className='fieldset'>
        <legend className='fieldset-legend text-gray-600 text-lg'>{label}</legend>
        {/* handles select vs input */}
        {type === "select" ? (
            <select
            defaultValue=""
            className='select capitalize w-full'
            {...register(fieldName)}
            disabled={isSubmitting}
            >
                <option value="">Select {label}</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
        ) : (
            <div className='relative'>
            <input 
                type={inputType}
                className={`input border border-gray-400 w-full h-12 p-2 rounded-lg mt-1 ${className}`}
                placeholder={placeholder || label}
                {...register(fieldName)}
                disabled={isSubmitting}
            />
            {/* toggle password visibility */}
            {type === "password" && 
            <button type="button" onClick={() => setIsVisible(!isVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer'>
            {isVisible ? <Eye /> : <EyeOffIcon />}
            </button>
            }
            </div>
        )}
        
    </fieldset>
    {/* validation errors */}
        {errors[fieldName]?.message && (
              <span className="text-xs text-red-500">
                {errors[fieldName]?.message}
              </span>
            )}

    </div>
  )
}
