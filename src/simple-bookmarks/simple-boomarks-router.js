const express= require('express')
//const path= require('path')
const {uuid} = require('uuidv4')
const logger = require('../logger')
const {isWebUri} = require('valid-url')
const bookMarks = require('../store')


const simpleBookmarksRouter= express.Router()
const jsonBodyParser= express.json()

/* SAMPLE BODY FOR POST REQ ON POSTMAN
    {
        "title": "FAA website",
        "url": "https://www.faa.gov/",
        "description": "Federal Aviation Administration",
        "rating": 5
    }
 */

simpleBookmarksRouter
    .route('/')
    .get((req,res)=>{
        res.json(bookMarks)
    })
    .post(jsonBodyParser,(req,res)=>{
        for (const field of ['title','url','description']) {
            if(!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send(`${field} is required`)}
        }
        //after all validation passed
        const {title,url,description,rating} = req.body //object destructuring 
        if(!Number.isInteger(rating)|| rating<0 || rating>5) {
            logger.error(`Invalid rating`)
            return res.status(400).send(`rating must be a number between 0 and 5`)
        }
        if (!isWebUri(url)) {
            logger.error(`Invalid url`)
            return res.status(400).send(`url must be a valid url`)
        }
        const bookMark= {id: uuid(),title,url,description,rating}
        bookMarks.push(bookMark)
        logger.info(`Bookmark with id ${bookMark.id} created`)
        res.status(201)
            .location(`http://localhost:8000/bookmarks/${bookMark.id}`)
            .json(bookMark)
    })

simpleBookmarksRouter
    .route('/:id')
    .get((req,res)=>{
        const {id} = req.params;
        const bookMark= bookMarks.find(b=>b.id==id)
        //validation middleware
        if(!bookMark) {
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(404).send(`Bookmark not found`)}
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

module.exports= simpleBookmarksRouter