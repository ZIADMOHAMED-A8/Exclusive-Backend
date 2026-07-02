import jwt from 'jsonwebtoken'
function generateAccessToken(data){
    const accessToken=jwt.sign(data,process.env.access_secret_key,{expiresIn:'30m'})
    return accessToken
}
function generatRefreshToken(data){
    const refreshToken=jwt.sign(data,process.env.access_secret_key,{expiresIn:'7d'})
    return refreshToken
}

export {generateAccessToken,
    generatRefreshToken
}