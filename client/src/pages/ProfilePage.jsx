import {React, useState, useContext} from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate =  useNavigate();
  const { authUser, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(authUser?.fullName || "")
  const [bio, setBio] = useState(authUser?.bio || "")
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    
    const formData = {
      fullName: name,
      bio: bio,
    };

    if (selectedImg) {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        formData.profilePic = reader.result;
        await updateProfile(formData);
        setLoading(false);
        navigate('/');
      };
      reader.readAsDataURL(selectedImg);
    } else {
      await updateProfile(formData);
      setLoading(false);
      navigate('/');
    }
  }

  return (
    <div className='h-full bg-[url("./assets/bgImage.svg")] bg-contain flex items-center justify-center p-4'>
        <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
            <h3 className='text-lg'>Profile Details</h3>
            <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
              <input onChange={(e)=>setSelectedImg(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden/>
              <img src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} alt="" className={`w-12 h-12 ${(selectedImg || authUser?.profilePic) && 'rounded-full'}`}/>
              upload profile image
            </label>
            <input onChange={(e)=>setName(e.target.value)} value={name} type="text" required placeholder='Your name' className='p-2 border border-gray-500
             rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'/>
             <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required className='p-2 border vorder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' rows={4}></textarea>
             <button type="submit" disabled={loading} className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
               {loading ? 'Saving...' : 'Save'}
             </button>
          </form>
          <img className='max-w-44 aspect-square rounded-fullmx-10 max-sm:mt-10' src={assets.logo_icon} alt="" />
        </div>
    </div>
  )
}

export default ProfilePage