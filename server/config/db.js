const mongoose=require("mongoose");
require("dotenv").config();
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connected ");
        console.log("DB HOST:", mongoose.connection.host);

    }catch(err){
        console.log("failed  to connect db");
        console.log(err);

    }

};
module.exports=connectDB;