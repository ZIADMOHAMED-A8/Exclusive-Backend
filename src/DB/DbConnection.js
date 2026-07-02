import mongoose from "mongoose";

const connectDB=async ()=>{
     mongoose.connect(process.env.DB_Url).then(()=>{
        console.log('mongo DB connected')
     })
     .catch((e)=>{
        console.error(e.message)
     })
}

export default connectDB