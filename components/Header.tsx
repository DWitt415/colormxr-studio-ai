import Link from 'next/link'
import React from 'react'

function Header() {
    return (
        <div className='bg-[#3D3d3d] h-[36px] w-full px-2 flex items-center justify-between border-b-2 border-[#606060]' style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <div className="flex items-center gap-2">
                <img src='/Colormxr-logo.svg' alt='logo' className='h-[26px]' />
                <Link href='/welcome' className='text-[#aeaeae] text-sm+ font-medium cursor-pointer'>Colormxr</Link>
                <h5 className='text-[#ababab] text-sm'>|</h5>
                <h5 className='text-[#5771FF] text-sm+ font-thin'>Interactive color play</h5>
            </div>
            
            <div className="flex items-center">
                {/* Gallery link removed as requested */}
            </div>
        </div>
    )  /* text-[#232323] */
}

export default Header