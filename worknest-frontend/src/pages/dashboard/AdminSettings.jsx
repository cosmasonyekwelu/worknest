import PageWrapper from '@/components/PageWrapper'
import UpdatePassword from '@/features/AdminApplication/UpdatePassword'
import UpdateProfile from '@/features/AdminApplication/UpdateProfile'
import UploadImage from '@/features/Profile/UploadImage'
import React from 'react'

export default function AdminSettings() {
  return (
    <PageWrapper title="Settings">
      <div className='w-full flex flex-col gap-6'>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <p className='text-gray-600'>Manage your account settings.</p>
        <div className='flex flex-col gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm'> <UploadImage /> </div>
        <UpdateProfile/>
        <UpdatePassword/>
          {/* Future settings options can be added here */}
        </div>
      </div>
      </PageWrapper>
  )
}
