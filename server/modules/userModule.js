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
// create a model with the name user with the where the data in the userSchema can be stored
// now i the model will be created anytime the code run so "mongoose.models.user" will check if the model is availble and use else use this "mongoose.model('user', userSchema)"
const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;