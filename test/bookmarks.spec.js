const knex= require('knex')
const bookmarkService = require('../src/bookmarks/bookmarks-service')
const fixtures = require('./bookmarks-fixtures')
const app = require('../src/app')
const supertest = require('supertest')

describe('Article service obj', ()=> {
    let db;
    //use this array to represent valid content of our db
    const testBookmarks= fixtures.makeBookmarksArray()
    //prepare the db connection 
    before('make knex Instance', ()=> {
        db= knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL}) 
        app.set('db', db)
        })
    //NOTE:  ()=> {return db().select()} vs ()=> db().select()
    
    before ('cleanup', ()=>db('bookmarks').truncate()) // remove all of the data from the table
    afterEach ('cleanup', ()=>db('bookmarks').truncate())
    after ('disconnect from db', ()=> db.destroy())// go of db connection 
    
    describe('Unauthorized request', ()=>{
        const testBookmarks= fixtures.makeBookmarksArray()
        beforeEach('insert bookmarks',()=>{
            return db.into('bookmarks').insert(testBookmarks) 
        })
        //supertest(app): pass the express server obj and invoke the endpoint
        it('GET /bookmarks 401 unauthorized respond', ()=>{
            return supertest(app).get('/bookmarks')
                .expect(401,{error:'Unauthorized request'})
        })
        it('POST /bookmarks/ 401 unauthorized respond', ()=>{
            return supertest(app).post('/bookmarks')
                .expect(401,{error:'Unauthorized request'}) 
        })
        it('GET /bookmarks/:id 401 unauthorized respond', ()=>{
            return supertest(app).get('/bookmarks/1')
                .expect(401,{error:'Unauthorized request'})
        })
        it('DELETE /bookmarks/:id 401 unauthorized respond', ()=>{
            return supertest(app).delete('/bookmarks/1')
                .expect(401,{error:'Unauthorized request'})
        }) 
    }) 

    describe('GET /bookmarks', ()=> {
        context('Given no bookmarks', ()=>{
            it(`respond with 200 and an empty list`, ()=>{
                return supertest(app).get('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })
        context('Given there are bookmarks', ()=>{
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
            it(`get the bookmarks from the store`,()=>{
                return supertest(app).get('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,testBookmarks)
            })
            
        })
    })

    describe('GET /bookmarks/:id', ()=> {
        context('Given no bookmark', ()=>{
            it(`Respond 404 bookmark doesn't exist`,()=>{
                return supertest(app).get('/bookmarks/123')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404,{error:{message:`Bookmark not found`}})
            })

        })
        context('Given there are bookmarks', ()=>{
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)  
            })
            it(`Respond with 200 and the specified bookmark`,()=>{
                const bookmarkId=2
                const expectedBookmark= testBookmarks[bookmarkId-1]
                return supertest(app).get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,expectedBookmark)
            })    
        })
    })

    describe.skip('DELETE /bookmarks/:id', ()=> {
        it('return 404 when bookmark does not exist', ()=>{
            return supertest(app).delete(`/bookmarks/123456`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404,`Bookmark not found`)
        })
        it.skip('remove the bookmark by ID from the store', ()=>{
            const bookmarkId=2
            const expectedBookmark= testBookmarks.filter(b=>b.id!==idToDelete)
            return supertest(app).delete(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(()=>{

                })
        })
    })

    describe.skip('POST /bookmarks', ()=> {
        /*
        const requiredFields = ['title','url','description']
        requiredFields.forEach(field=>{
            const newItem= {title,url,description}
            it(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                delete newItem[field]
                return supertest(app).post(`/bookmarks`)
                .expect(400,`${fiels} is missing`)
            })
        })*/
        
        it('add a new bookmark to the store', ()=> {
            const newBookmark= {
                title: 'test title',
                url: `http://test.com`, 
                description: `test description`,
            }
            return supertest(app).post(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res=>{

                })
                .then(res=>{

                })
        })
        //XSS, known as cross-site scripting. We can prevent XSS attacks by "sanitizing" the content in our reponse data, by (1) ESCAPING any potential script elements (2) suspicious JS in response data 
        /*
        context('Given an XSS attack bookmark', ()=>{
            const maliciousBookmark=''
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(maliciousBookmark)
            })
            it('remove XSS attack content', ()=> {

            })
        })*/
    })
})