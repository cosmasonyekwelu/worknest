import { Link } from 'react-router'

export default function BottomFooter() {
  return (
    <div className='flex-col flex lg:flex-row justify-between py-5'>
      <div className="flex items-center gap-4 text-[#FFFFFF] text-[14px] md:text-[18px]">
        <Link to="/terms-of-service">
          <p>Terms & Conditions</p>
        </Link>
        <Link to="/privacy-policy">
          <p>Privacy & Policy</p>
        </Link>
      </div>
      <div>
        <p className='text-[#FFFFFF] text-[14px] md:text-[18px]'>© 2026 Work Nest. Crafted for the future of work.</p>
      </div>
    </div>
  )
}
