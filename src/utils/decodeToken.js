import jwt from 'jsonwebtoken'



function decodeAccessToken(req){
    const token=req.headers.authorization.split(' ')[1]
    const decodedToken=jwt.verify(token,process.env.access_secret_key)
    return decodedToken
}
function decodeRefreshToken(req){
    console.log(req.headers.authorization.split(' ')[1],process.env.refresh_secret_key)
    const token=req.headers.authorization.split(' ')[1]
    const decodedToken=jwt.verify(token,process.env.refresh_secret_key)
    return decodedToken
}
export {
    decodeAccessToken,
    decodeRefreshToken
}