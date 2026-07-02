import bcrypt from "bcryptjs";
const SALT_ROUNDS = 10;
async function hashValues(val){
    const hashedVal=await bcrypt.hash(val,SALT_ROUNDS)    
    return hashedVal
}

async function compare(plainText,hashed){
    const result=await bcrypt.compare(plainText,hashed)
    return result
}
export{
    hashValues as hash,
    compare
}