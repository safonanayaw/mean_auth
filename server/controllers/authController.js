import bcrypt from 'bcryptjs ';
import jwt from 'jsonwebtoken';
import userModel from '../modules/userModule.js';

// ******* Controller for user register ************
export const register = async (req, res)=> {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        returnres.json({success: false, message: 'Missing Details'})
    }

    try{
        //checking if user already exist before adding data to db
        const existingUser = await userModel.findOne({email})
        //checking if existingUer return true
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