// middle ware to grab userId from token, where token is grab from cookie

import jwt from 'jsonwebtoken';
//next will be executed after the code in userAuth is executed and call 
//the controller fxn sendVerifyOtp
const userAuth = async (req, res, next) =>{
    //grab the token from the req.cookies
    const {token} = req.cookies;
    //return error msg if token return false
    if(!token){
        return res.json({success: false, message: "Not Authorised. Login Again"});
    }

    //if token return true
    try {
        //verify and decode the code return from the cookies
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRETE);

        //check if tokenDecode.id is true then asign token id to req.body.userId
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
        }else{
            return res.json({success: false, message: "Not Authorised. Login Again"})
        }

        //execute the controller fxn sendVerifyOtp
        next();


    } catch (error) {
        return res.json({success: false, message: error.message})
    }
} 
export default userAuth;