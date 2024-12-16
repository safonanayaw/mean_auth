import userModel from "../modules/userModule.js";
//userController to get user data from db using 
//userId from the userAuth middleware
export const getUserData = async (req, res)=> {
    try {
        const {userId} = req.body;
        //grab user by using userId where userId is is grabbed from token in the cookie
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: "user not found"});
        }

        //return the user data if user exist
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}