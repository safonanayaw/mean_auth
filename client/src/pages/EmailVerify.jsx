import axios from 'axios'
import {toast} from 'react-toastify'
import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom';

const EmailVerify = () => {

  //send cookie with api call
  axios.defaults.withCrendentials = true;

  //adding backEndurl from AppContext
  const {backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext)

  //useNavigate hook for navigating
  const navigate = useNavigate()

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

    //fxn to handle form data
    //submit otp to api call endpoint
    const onSubmitHnadler = async (e) =>{
      try {
        //prevent the default functionality that will reloard the page when form is submitted
        e.preventDefault()
        
        //add all input field data into otpArray array
        const otpArray = inputRefs.current.map(e=>e.value)
        //join the array elements in otpArray into single string
        const otp = otpArray.join('');
        //send otp to backend api

        //sending the otp to the backend
        const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})
        if(data.success){
          toast.success(data.message)
          //get user data after otp is true
          getUserData()
          //navigate to home page using useNavigate hook
          navigate('/')

        }else{
          toast.error(data.message)
        }
        
      } catch (error) {
        toast.error(error.message)
      }
    }  
    // after verifing otp automatically redirect user to home page if 
    //user navigate to email-verify page, as user is already verify
    useEffect(()=>{
      isLoggedin && userData && userData.isAccountVerified && navigate('/')
    }, [userData, isLoggedin,])


  return (

    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img 
      onClick={()=>navigate('/')}
      src={assets.logo} alt=""  className='absolute left-5 sm:left-20 top-5 w-28 sm:-32 cursor-pointer'/>

      <form onSubmit={onSubmitHnadler} className='bg-slate-900 p-8 rounded-lg shadow-lg -96 text-sm'>

        <h1 className='text-white text-2xl text-semibold  text-center mb-4'>Email Verify OTP</h1>
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
        <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white'>Verify Email</button>
        
      </form>
    </div>
  )
}

export default EmailVerify
