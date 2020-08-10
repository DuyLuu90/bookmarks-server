// all the related endpoints will be grouped in this file (reorganized the code)
const express= require('express')

//SERVICE:
const BookmarksService = require('./bookmarks-service')

//TOOLS:
const path=require('path')
const {uuid} = require('uuidv4')
const logger = require('../logger')
const {isWebUri} = require('valid-url')
const xss= require('xss')

//const bookMarks = require('../store')


const bookmarksRouter= express.Router()
const bodyParser= express.json() 

const sanitizedBookmark = bookMark => ({
    id: bookMark.id,
    title: xss(bookMark.title),
    url: bookMark.url,
    description: xss(bookMark.description),
    rating: Number(bookMark.rating)
})
bookmarksRouter.route('/')
.get((req,res,next)=>{
    BookmarksService.getAllBookmarks(req.app.get('db'))
        .then(bookMarks=>{
            res.status(200).json(bookMarks.map(sanitizedBookmark))})
        .catch(next)
}) 
.post(bodyParser,(req,res,next)=>{
    const {title,url,description,rating} = req.body  
    const  newBookMark= {title, url, description,rating}
    
    for (const field of ['title','url','description','rating']) {
        if(!req.body[field]) {
            //logger.error(`${field} is required`)
            return res.status(400).send(`${field} is required`)}
    }
    if(!Number.isInteger(rating)|| rating<0 || rating>5) {
        //logger.error(`Invalid rating`)
        return res.status(400).send(`rating must be a number between 0 and 5`)
    }
    if (!isWebUri(url)) {
        //logger.error(`Invalid url`)
        return res.status(400).send(`url must be a valid url`)
    }
    
    BookmarksService.insertBookmark(req.app.get('db'),newBookMark)
    .then((bookMark)=>{
        res.status(201).location(path.posix.join(req.originalUrl,`/${bookMark.id}`))
        .json(sanitizedBookmark(bookMark))
    })
    .catch(next)
}) 

bookmarksRouter.route('/:id')
.all((req,res,next)=>{
    const {id}= req.params
    BookmarksService.getById(req.app.get('db'),id)
        .then(bookMark=>{
            if (!bookMark) {
                return res.status(404).json({error:{message:`Bookmark not found`}})
            }
            res.bookMark= bookMark
            next()
        })
        .catch(next)
})
.get((req,res)=>{
    res.json(sanitizedBookmark(res.bookMark))
})
.delete((req,res,next)=>{
    const {id} = req.params;
    BookmarksService.deleteBookmark(req.app.get('db'),id)
    .then(()=>{res.status(200).json('success')})
    .catch(next)
}) 
.patch(bodyParser,(req,res,next)=>{
    //const {id} = req.params;
    const {title,url,description,rating}=req.body
    const bookMarkToUpdate= {title,url,description,rating} 
    const knex=req.app.get('db')

    const numberOfValues= Object.values(bookMarkToUpdate).filter(Boolean).length
    if (numberOfValues===0) {
        return res.status(400).json({
            error:{ message: `Req body must contain either 'title','url',or'description'`}})
    }
    
    BookmarksService.updateBookmark(knex,req.params.id,bookMarkToUpdate)
    .then(()=>res.status(200).json('Success'))
    .catch(next)
})

module.exports = bookmarksRouter