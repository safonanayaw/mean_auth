import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, default: ''},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, deafault: ''},
    resetOtpExpireAt: {type: Number, default: 0},
})
// create a model with the name user where the data in the userSchema can be stored
// the model will be created anytime the code run so "mongoose.models.user" will 
//check if the model is availble wont create, if model is unavailable then create model
const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;