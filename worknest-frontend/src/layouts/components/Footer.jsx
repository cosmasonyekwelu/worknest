import React from 'react';
import TopFooter from '@/components/TopFooter';
import BottomFooter from '@/components/BottomFooter';



export default function Footer() {
  return (
    <footer className='mt-10'>
      <div className="bg-[#FFFFFF] w-full">
        <div className="container">
          <TopFooter />
        </div>
      </div>
      <div className=" bg-[#434343] w-full">
        <div className="container">
          <BottomFooter />
        </div>
      </div>
    </footer>
  )
}
