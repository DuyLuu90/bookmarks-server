const express= require('express')
const {uuid} = require('uuidv4')
const {isWebUri} = require('valid-url')
const logger = require('../src/logger')
const {bookMarks} = require('./store')



const bookmarksRouter= express.Router()
const bodyParser= express.json() //to specify which will need to use a JSON body parser


bookmarksRouter
.route('/bookmarks')
.get((req,res)=>res.json(bookMarks)) //middleware
.post(bodyParser,(req,res)=>{
//validation middleware -> header
    const {id, title, url, description} = req.body// object destructuring
    console.log(req.body)
    if (!title) {
        logger.error('Title is required')
        return res.status(400).send('error')
    }
    if (!description) {
        logger.error('Description is required')
        return res.status(400).send('error')
    if (!isWebUri(url)) {
        logger.error('Url must be a valid url')
        return res.status(400).send('error')
    }
    }
//after all validation passed
    const  bookMark= {id:uuid(), title, url, description}
    bookMarks.push(bookMark)
    logger.info(`Bookmark with id ${bookMark.id} created`)
    res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${bookMark.id}`)
    .json(bookMark)
}) 


bookmarksRouter
.route('/bookmarks/:id')
.get((req,res)=>{
    const {id} = req.params;
    const bookMark= bookMarks.find(b=>b.id==id)
    //validation middleware
    if(!bookMark) {
        logger.error(`Bookmark with id ${id} not found`);
        return res.status(404).send('Bookmark not found')
    }
    //return response
    res.json(bookMark)
}) 
.delete((req,res)=>{
    const {id} = req.params;
    const index= bookMarks.findIndex(b=>b.id==id)
    //validation middleware
    if (index === -1) {
        logger.error(`Bookmark with id ${id} not found`)
        return res.status(404).send('Bookmark not found')
    }
    //return response
    bookMarks.splice(index,1);
    logger.info(`Bookmark with id ${id} deleted`)
    res.status(204).end()
}) //middleware

module.exports = bookmarksRouter