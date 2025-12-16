const mongoose=require("mongoose");
const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
        console.log("mongodb connected ");

    }catch(err){
        console.log("failed  to connect db");
        console.log(err);

    }

};
module.exports=connectDB;