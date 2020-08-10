//SETUP
require('dotenv').config() 
const express= require('express') 
const morgan= require('morgan') // midleware, used for logging request details
const cors = require('cors')
const helmet= require('helmet')
//const logger= require('./logger')

//IMPORT DATA
const {NODE_ENV, API_TOKEN}= require('./config')
const bookmarksRouter = require('./bookmarks/bookmarks-router')
//const simplebookmarksRouter= require('./simple-bookmarks/simple-boomarks-router')
//const bookmarks= require('./store')

/*OPTIONAL
const {v4: uuid} require('uuid')
*/

// CREATE AN EXPRESS APP and gives us access to the other express objects, provides methods to route HTTP requests, configure middleware and other functionality
const app= express() 

//MIDDLEWARES
app.use(express.json())//parse the body and give us a properly formatted obj

/*
app.use(morgan((NODE_ENV === 'production') 
    ? 'tiny' 
    : 'common', {skip: () => NODE_ENV === 'test',}
))*/

app.use(cors())
app.use(helmet())

//AUTHORIZATION
app.use((req, res, next)=>{
    const userAuth= req.get('Authorization')
    if(!userAuth || userAuth.split(' ')[1] !== API_TOKEN) {
        //logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({error: "Unauthorized request"})}
    next();
})

//HTTP REQUESTS (method+headers+body)
app.use('/api/bookmarks',bookmarksRouter)
//app.use('/bookmarks',simplebookmarksRouter)

/*
app.get('/', (req,res)=>{
    const responseText = {
        "Base URL": req.baseUrl,
        "Host": req.hostname,
        "Path": req.path,
        "Query": req.query.name,
        "Content": bookmarks}
    res.json(responseText) // to respond to the client with no content, use end()
})

app.get('/xss', (req, res) => {
    res.cookie('secretToken', '1234567890');
    res.sendFile(__dirname + '/drills/xss-example.html');
});*/

//ERROR HANDLING
app.use((error, req,res, next)=>{
    let response;
    if (NODE_ENV === 'production') {
        response= {error: {message: 'server error'}}
    }
    else response={message: error.message, error}
    res.status(500).json(response)
})

module.exports = app 