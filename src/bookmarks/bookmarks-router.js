// all the related endpoints will be grouped in this file (reorganized the code)
const express= require('express')
//const {uuid} = require('uuidv4')
const logger = require('../logger')
//const {isWebUri} = require('valid-url')
const xss= require('xss')

const bookMarks = require('../store')
const BookmarksService = require('./bookmarks-service')
//const BookmarksService= require('./bookmarks-service')
const bookmarksRouter= express.Router()
const bodyParser= express.json() //to specify which will need to use a JSON body parser


const sanitizedBookmark = bookMark => ({
    id: bookMark.id,
    title: xss(bookMark.title),
    url: bookMark.url,
    description: xss(bookMark.description)
})

bookmarksRouter
.route('/bookmarks')
.get((req,res,next)=>{
    BookmarksService.getAllBookmarks(req.app.get('db'))
        .then(bookMarks=>res.status(200).json(bookMarks.map(sanitizedBookmark)))
        .catch(next)
}) 
.post(bodyParser,(req,res,next)=>{
    //validation middleware -> header
    for (const field of ['title','url','description']) {
        if(!req.body[field]) {
            logger.error(`${field} is required`)
            return res.status(400).send(`${field} is required`)}
    }
    //after all validation passed
    const {title,url,description} = req.body
    const  newBookMark= {title, url, description}
    bookMarks.push(newBookMark)
    logger.info(`Bookmark with id ${newBookMark.id} created`)
    BookmarksService.insertBookmark(req.app.get('db'),newBookMark)
    .then(()=>{
        res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${newBookMark.id}`)
        .json(newBookMark)
    })
    .catch(next)
    
}) 


bookmarksRouter
.route('/bookmarks/:id')
.get((req,res)=>{
    const {id} = req.params;
    const bookMark= bookMarks.find(b=>b.id==id)
    //validation middleware
    if(!bookMark) {
        logger.error(`Bookmark with id ${id} not found`);
        return res.status(404).json({error:{message:`Bookmark not found`}})}
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
}) 

module.exports = bookmarksRouter