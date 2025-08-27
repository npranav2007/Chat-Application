import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
    const [currentState, setCurrentState] = useState("Sign Up");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isDataSubmited, setIsDataSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmitHandler = async (event)=>{
        event.preventDefault();
        if(currentState === "Sign Up" && !isDataSubmited){
            setIsDataSubmitted(true);
            return;
        }
        
        setLoading(true);
        const result = await login(currentState === "Sign Up" ? 'signup' : 'login', { fullName, email, password, bio });
        setLoading(false);
        
        if (result.success) {
            navigate('/');
        }
    }
    
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
        {/* Left */}
        <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />
        {/* Right */}
        <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
            <h2 className='font-medium text-2xl flex justify-between items-center'>
                {currentState}
                {isDataSubmited && <img onClick={()=>setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}
            </h2>
            {currentState === "Sign Up" && (
                <input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required/>
            )}
            {!isDataSubmited && (
                <>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required />
                </>
            )}
            {currentState === "Sign Up" && isDataSubmited && (
                    <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows = {4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a short bio...'></textarea>
                )
            }
            <button type='submit' disabled={loading} className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                {loading ? "Please wait..." : (currentState === "Sign Up" ? "Create Account" : "Login Now")}
            </button>

            <div className='flex flex-col gap-2'>
                {currentState === "Sign Up" ? (
                    <p className='test-sm text-gray-600'>Already Have an account? <span onClick={()=>{setCurrentState("Login");setIsDataSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login Here</span></p>
                ) : (
                    <p className='test-sm text-gray-600'>Create an Account <span onClick={()=>{setCurrentState("Sign Up")}} className='font-medium text-violet-500 cursor-pointer'>Click Here</span></p>
                )}
            </div>
        </form>
    </div>
  )
}

export default LoginPage