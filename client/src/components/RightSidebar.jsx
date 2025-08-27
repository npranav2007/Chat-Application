import React from 'react'
import assets from '../assets/assets'

const RightSidebar = ({selectedUser, onClose}) => {
  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser}?"max-md:hidden" : ""`}>
        {/* Mobile close button */}
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2 md:hidden z-10"
            >
                ✕
            </button>
        )}
        <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full' />
            <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                <p className='w-2 h-2 rounded-full bg-green-500'></p>
                {selectedUser.fullName}
                </h1>
                <p className='px-10 mx-auto'>{selectedUser.bio}</p>
        </div>
        <hr className='border-[#ffffff50] mx-4 my-4' />
        <div className='px-5 text-xs'>
            <p>Media</p>
            <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
                <p className='text-gray-400 text-center col-span-2'>No media shared yet</p>
            </div>
        </div>

    </div>
  )
}

export default RightSidebar