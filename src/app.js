require('dotenv').config() // allow us to get access to variables inside the env file
const express= require('express')
const morgan= require('morgan') // midleware, used for logging request details
const cors = require('cors')
const helmet= require('helmet')
const {NODE_ENV, API_TOKEN}= require('./config')
const bookmarksRouter = require('../bookmarks/bookmarks-router')
const logger= require('./logger')

const app= express()
app.use(express.json()) //middleware 

const morganSetting=(NODE_ENV === 'production'? 'tiny': 'common')
app.use(morgan(morganSetting)) //combined vs common vs dev vs short vs tiny
app.use(cors())
app.use(helmet())

//middleware funtion to validate that an Auth header with an API token was present
app.use((req, res, next)=>{
    console.log(NODE_ENV)
    const ourToken= API_TOKEN
    console.log(ourToken)
    const userAuth= req.get('Authorization')
    console.log(userAuth)
    if(!userAuth || userAuth.split(' ')[1] !== ourToken) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).send('Unauthorized')}
    // res.status(401).json({error: "Unauthorized"})
    next();//take the request and pass it to the middleware
})
app.use(bookmarksRouter)




app.get('/', (req,res)=>{
    res.send("A GET Request")
})
app.post('/', (req,res)=>{
    console.log(req.body) // use express.json()
    res.send('POST request received')
})


//error handler middleware
app.use((error, req,res, next)=>{
    let response;
    if (NODE_ENV === 'production') {
        response= {error: {message: 'server error'}}
    }
    else response={message: error.message, error}
    res.status(500).json(response)
})



module.exports = app 