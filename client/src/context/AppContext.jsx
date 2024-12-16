import axios from "axios";
import { createContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export const AppContext = createContext()

export const AppContextProvider = (props)=>{
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);

    //get auth state
    //for this function to get executed when the page load, use useEffect hook
    const getAuthState = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            //if user is authenticated data.success is true ; setIsLoggedin to true
            if(data.success){
                setIsLoggedin(true)

                getUserData()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //fxn to get user data
    const getUserData = async ()=>{
        try{
            const {data} = await axios.get(backendUrl +'/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message)
        }catch(error){
            toast.error(error.message)
        }
    }

    //when page load check the auth state and get user details 
        useEffect(()=>{
            getAuthState();
        }, [])



    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData
    };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}