import mongoose from "mongoose";

const connectDB=async ()=>{
     return mongoose.connect(process.env.DB_Url).then(()=>{
     })
     .catch((e)=>{
        console.error(e.message)
        throw e
     })
}

export default connectDB
