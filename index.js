import express from 'express'
import bootstrap from './src/app.controller.js'

const app=express()


const server=app.listen(5000,()=>{
    console.log('listening on 5000')
})
bootstrap(app,express)