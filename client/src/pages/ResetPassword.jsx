import axios from 'axios'
import {toast} from 'react-toastify'
import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'



const ResetPassword = () => {
  const {backendUrl} = useContext(AppContext)
  axios.defaults.withCredentials = true
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState(0)
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)




    //storing the otp values using input refs
    const inputRefs = React.useRef([])

    //manually moving cursor to empty input field after inserting fxn
    const handleInput = (e, index)=>{
      if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
        inputRefs.current[index + 1].focus(); 
      }
    }
    //handle paste feature
    const handlePaste = (e, index)=>{
      const paste = e.clipboardData.getData('text')
      //split the copied data into array
      const pasteArray = paste.split('');
      //paste each array element in each input field
      pasteArray.forEach((char, index)=>{
        if(inputRefs.current[index]){
          inputRefs.current[index].value = char;
        }
      })
    }

    //move cursor backwards when backspace is use on current input(inputRefs.current)
    const handleKeyDown = (e, index)=>{
      if(e.key === 'Backspace' && e.target.value === '' && index > 0){
        inputRefs.current[index - 1].focus(); 
      }
    }

    const onSubmitEmail = async (e) => {
      e.preventDefault();
      try{
        const {data} = await axios.post(backendUrl + "/api/auth/send-reset-otp", {email})
        data.success ? toast.success(data.message) : toast.error(data.message)
        data.success && setIsEmailSent(true)
      }catch(error){
        toast.error(error.message)
      }
    }

    const onSubmitOtp = async (e) =>{
      e.preventDefault()
      try{
        const otpArray = inputRefs.current.map(e => e.value)
        setOtp(otpArray.join(''))

        setIsOtpSubmitted(true)
      }catch(error){

      }
    }

    const onSubmitNewPassword = async (e) => {
      e.preventDefault()
      try{
        const {data} = await axios.post(backendUrl + "/api/auth/reset-password", {email, otp, newPassword})
        data.success ? toast.success(data.message) : toast.error(data.message)
        data.success && navigate("/login")
      }catch(error){
        toast.error(error.message)
      }
    }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt=""  className='absolute left-5 sm:left-20 top-5 w-28 sm:-32 cursor-pointer'/>
      
      {/* Display first form when email is not set */}
      {/* enter email id */}
      {!isEmailSent && 
        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl text-semibold  text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
        <div class="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
          <img src={assets.mail_icon} alt="" className='w-3 h-3'/>
          <input type="email" placeholder="Email id" className='bg-transparent outline-none text-white' value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <button className='w-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white mt-3 rounded-full py-2.5'>Submit</button>
        </form>
      }

      {/* form for adding otp */}
      {!isOtpSubmitted && isEmailSent && 
      
            <form onSubmit={onSubmitOtp}  className='bg-slate-900 p-8 rounded-lg shadow-lg -96 text-sm'>

              <h1 className='text-white text-2xl text-semibold  text-center mb-4'>Reset Password OTP</h1>
              <p className='text-center mb-6 text-indigo-300'>Enter the 6-digits code sent to your email</p>
              <div className='flex justify-between mb-8' onPaste={handlePaste}>
              {Array(6).fill(0).map((_, index)=>(
                <input type="text" maxLength='1' key={index} required 
                className='w-10 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                //storing the input field value
                ref={e => inputRefs.current[index] = e}
                //manually moving the cursor to empty input field after inserting
                onInput={(e)=> handleInput(e, index)}
                //delete and move to previous input when back space is pressed
                onKeyDown={(e)=> handleKeyDown(e, index)}
                />
              ))}
              </div>
              <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white'>Submit</button>

        </form>
      }
    {/* enter new password */}
{isEmailSent && isOtpSubmitted && 

    <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
      <h1 className='text-white text-2xl text-semibold  text-center mb-4'>New Password</h1>
      <p className='text-center mb-6 text-indigo-300'>Enter your new password below</p>
      <div class="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
        <img src={assets.lock_icon} alt="" className='w-3 h-3'/>
        <input type="password" placeholder="Password" className='bg-transparent outline-none text-white' value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
      </div>
      <button className='w-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white mt-3 rounded-full py-2.5'>Submit</button>
      </form>
}
    </div>
  )
}

export default ResetPassword
