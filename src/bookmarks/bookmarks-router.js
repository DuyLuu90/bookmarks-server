// all the related endpoints will be grouped in this file (reorganized the code)
const express= require('express')
//const {uuid} = require('uuidv4')
const logger = require('../logger')
//const {isWebUri} = require('valid-url')
const xss= require('xss')

const bookMarks = require('../store')
const BookmarksService = require('./bookmarks-service')
const bookmarksRouter= express.Router()
const bodyParser= express.json() //parse the body and give us the JSON obj to work with


const sanitizedBookmark = bookMark => ({
    id: bookMark.id,
    title: xss(bookMark.title),
    url: bookMark.url,
    description: xss(bookMark.description)
})
bookmarksRouter
.route('/api/bookmarks')
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
    const {title,url,description} = req.body //object destructuring 
    const  newBookMark= {title, url, description}
    bookMarks.push(newBookMark)
    logger.info(`Bookmark with id ${newBookMark.id} created`)
    BookmarksService.insertBookmark(req.app.get('db'),newBookMark)
    .then(()=>{
        res
        .status(201)
        .location(`http://localhost:8000/api/bookmarks/${newBookMark.id}`)
        .json(newBookMark)
    })
    .catch(next)
    
}) 

bookmarksRouter
.route('/api/bookmarks/:id')
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
.patch(bodyParser,(req,res,next)=>{
    const {title,url,description}=req.body
    const bookMarkToUpdate= {title,url,description} 
    const knex=req.app.get('db')
    BookmarksService.updateBookmark(knex,req.params.id,bookMarkToUpdate)
        .then((bookMark)=>{
            console.log(bookMark)
            const numberOfValues= Object.values(bookMark).filter(Boolean).length
            if(!bookMark) {
                logger.error(`Bookmark with id ${id} not found`);
                return res.status(404).json({error:{message:`Bookmark doesn't exist`}})}

            else if (numberOfValues===0) {
                return res.status(400).json({
                    error:{ message: `Req body must contain either 'title','url',or'description'`}
                })
            }
            else return res.status(204).end()})
        .catch((err)=>{
            console.log(err)
            next()
        })
})

module.exports = bookmarksRouter