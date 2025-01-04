import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    name:{type:String,required:[true,"Please add your name"]},
    email:{type:String,required:[true,"Please add  email"]},
    password:{type:String,required:[true,"Please enter your password"]},
},{minimize:false})


const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;