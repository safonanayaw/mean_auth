import axios from 'axios'
import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Navbar = () => {
    const navigate = useNavigate()
    const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

    //navbar api endpoint send-verification-otp fxn
    const sendVerificationOtp = async ()=>{
      try {
        //send cookies
        axios.defaults.withCredentials = true;
        //make api call on the send-verification-otp API end point
        const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
        if(data.success){
          navigate('/email-verify')
          toast.success(data.message)
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
      //logout fxn
    const logout = async ()=>{
      try{
        // in order to send cookie in the api call
        axios.defaults.withCredentials = true;

        const {data} = await axios.post(backendUrl + '/api/auth/logout')
        // if data.success is true
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        //navigate user to home page
        navigate('/')
      }catch(error){
        toast.error(error.message)
      }
    }

  return (
    <div className='w-full flex justify-between item-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img src={assets.logo} alt="" className='w-28 sm:w-32'/>

      {userData ? 
      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
        {/* grab user name initial char to uppercase */}
        {userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>

          <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>

            {/* check user db isAccountVerified status and hide or display "Verify Email"*/}
            {!userData.isAccountVerified && <li onClick={sendVerificationOtp} className='px-1 py-2 hover:bg-gray-200 cursor-pointer'>Verify email</li>}

            {/* logout li */}
            <li onClick={logout} className='px-1 py-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
          </ul>
        </div>
      </div>
      : <button onClick={()=>navigate('/login')} className='flex items-center gap-2 border border-gray-500 
      rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'>Login <img src={assets.arrow_icon} alt="" /></button>
    }
      
    </div>
  )
}

export default Navbar
