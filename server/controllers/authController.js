import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../modules/userModule.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

// ******* Controller for user register ************
export const register = async (req, res)=> {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        returnres.json({success: false, message: 'Missing Details'})
    }

    try{
        //checking if user already exist before adding data to db
        const existingUser = await userModel.findOne({email})
        //checking if User already exist, return true
        if(existingUser){
            res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //if existingUser return false then create user with req name, email and password: hashedPassword
        const user = new userModel({name, email, password: hashedPassword})

        //save user in db
        await user.save();

        //send authentication which I use cookie, generate cookie using jwt
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRETE, {expiresIn: '7d'});

        //after adding the user data in db send a res to the user with cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending welcome email after user is added successfully
       const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to TheAlienTec',
        text: `Welcome to TheAlienTec Website your account has been created with the email id: ${email}`
       }
       await transporter.sendMail(mailOptions);

        return res.json({success: true});

    }catch(error){
        res.json({success:false, message: error.message})
    }
}

// ******* Controller for user Login ************

export const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        res.json({success: false, message: "Email and Password are required"})
    }

    try{
        //query email in db if it exist
        const user = await userModel.findOne({email});
        // if user return false {doesn't exist}
        if(!user){
            res.json({success: false, message: "Invalid email"})
        }

        //if user return true {exist} and check for password
        //before compare hashedPassword save in db with req.password with bcrypt method compare
        const isMatch = await bcrypt.compare(password, user.password)

        //if isMatch return false, thus req.password and db hashedPassword password doesn't match
        if(!isMatch){
            res.json({success: false, message: "Invalid Password"})
        }

        // if isMatch return true then generate a new token
       //send authentication using cookie, generate cookie using jwt
       const token = jwt.sign({id: user._id}, process.env.JWT_SECRETE, {expiresIn: '7d'});

       //
       res.cookie('token', token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === 'production',
           sameSite: process.env.NODE_ENV === 'production'? 'none' : 'strict',
           maxAge: 7 * 24 * 60 * 60 * 1000
       }); 

       return res.json({success: true});

        // if user email and password exist in db  then generate token
    } catch(error){
        res.json({success: false, message: error.message})
    }
} 

// ******* Controller for user LogOut ************

export const logout = async (req, res)=> {
    try{
        //to logout first clear the user coookie with the cookie name "token"
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'none' : 'strict',
        })

        return res.json({success: true, message: 'Logged Out'})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}


// ******* Send verification otp to user's Email ************
export const sendVerifyOtp = async (req, res)=> {
    try{
        //grab the user id from the request body
        const {userId} = req.body;
        

        //query by userId if user exist in db
        const user = await userModel.findById(userId);

        //if user Acount is verified thus "true" then user is already verified
        if(user.isAccountVerified){
            return res.json({success: false, message: "Account already verified"})
        }

        //generate six digit random numbers converted to string otp
       const otp = String(Math.floor(100000 + Math.random() * 900000));

        //save the otp into this user db
        user.verifyOtp = otp;

        //set the otp expiry to one day
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        //after save this property into thw database
        await user.save();

        //after saving user data send otp to user email to verify account
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            // text: `Verify your account using this OTP: ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }
        //
        await transporter.sendMail(mailOptions);
        res.json({success: true, message: `Verification OTP Sent on your email ${user.email}`});

    }catch(error){
        res.json({success: false, message: error.message})
    }
}

// user email with otp
export const verifyEmail = async (req, res)=> {
    //user will type otp in ui then send in req.
    //the userId is available in the token where token is in the cookie. 
    //Will create a middle where to grab the token, then grab the userId from the token
    const {userId, otp} = req.body;
    
    //if user and otp is not true
    if(!userId || !otp){
        return res.json({success: false, message: "Missing Details"});
    }

    try {
        //find userId in db
        const user = await userModel.findById(userId);
        
        //error message if user return false
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        //error message if user db verifyOtp is empty string or doesn't match otp
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"});
        }

        //if Date.now() is greater than verifyOtpExpireAt then otp is expired
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP Expired"});
        }

        //if verifyOtpExpireAt is greater than date.now then otp is not expire
        //reset and resave user.verifyOtp, user.verifyOtpExpireAt and save to db
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        
        //save new user data to db
        await user.save();
        return res.json({success: true, message: "Email verified successfully"});


    } catch (error) {
        return res.json({success: false, message: error.message});
    }

}
//check if user is authenticated by using token is in the cookie
export const isAuthenticated = async (req, res)=>{
    try {
        return res.json({success: true, message: "user is authenticated"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//Send password reset otp
export const sendResetOtp = async (req, res)=>{
    //grab user email
    const {email} = req.body;
    //check if email exist in db
    if(!email){
        return res.json({success: false, message: "Email is required"});
    }
    try {
        //find user from req.user
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not found"});
        }

        //if user is available then generate otp, save otp verifyotpExpireAt to db
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        //save user data to db
        await user.save();

        //send user reset otp to email to verify
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OTP',
            // text: `Your Password reset OTP code is ${otp}, Use this OTP to proceed with resetting your password`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };
        await transporter.sendMail(mailOption);

        return res.json({success: true, message: "OTP sent to your email"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//Reset user password
export const resetPassword = async (req, res)=>{
    //grab email, otp, newPassword
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Email, OTP, new Password required"});
    }
        
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "user not found"});
        }

        if(user.resetOtp ==="" || user.resetOtp !== otp){
            return res.json({sucess: false, message: "Invalid OTP"})
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP expired"});
        }

        //if otp isnot expired then update user password
        //first encrypt password and store in db
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "Password has been reset successfully"})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}