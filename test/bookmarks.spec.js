const knex= require('knex')
const bookmarkService = require('../src/bookmarks/bookmarks-service')
const fixtures = require('./bookmarks-fixtures')
const app = require('../src/app')

/* 
TEST-DRIVEN DEVELOPMENT (TDD): 3 part process
    RED: write a test and see it fails
    GREEN: write "implementation" code to make the test pass
    REFACTOR: refactor both the test code and implementation code 
MOCHA HOOKS: before,after,beforeEach,afterEach (same hook will execute in order, different hooks will run in the expected sequence). Whenver we set a context with data present, we should always include a beforeEach() hook within the context to add the data to our table
TEST CASE PATTERN:
    Setup data-> invoke the function to be tested-> -> ASSERT that the results meet our expectation 
*/
// skip() vs only() (exclusive vs inclusive)
describe('Article service obj', ()=> {
    let db;
    //use this array to represent valid content of our db
    const testBookmarks= fixtures.makeBookmarksArray()
    //prepare the db connection using the db var avai in the scope of the primary describe block (it will be availabe in all of our tests)
    before('make knex Instance', ()=> {
        db= knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL}) 
        //app.set('db', db)
        })
    //NOTE:  ()=> {return db().select()} vs ()=> db().select()
    
    before ('cleanup', ()=>db('bookmarks').truncate()) // remove all of the data from the table
    afterEach ('cleanup', ()=>db('bookmarks').truncate())
    after ('disconnect from db', ()=> db.destroy())// go of db connection 
    /*
    describe('get all bookmarks', ()=>{
        const testBookmarks = require('../src/bookmarks/store')
        beforeEach(()=>{
            return db.into('bookmarks').insert(testBookmarks)
        })
        it('resolves all bookmarks from bookmarks table', ()=>{
            return bookmarkService.getAllBookmarks(db)
                .then(actual=>expect(actual).to.eql(testBookmarks))
        })
    })*/

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


/*
    describe('GET /bookmarks', ()=> {
        context('Given no bookmarks', ()=>{

        })
        context('Given there are bookmarks', ()=>{
            const testBookmarks= fixtures.makeBookmarksArray()
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
            
        })
        context('Given an XSS attack bookmark', ()=>{
            const maliciousBookmark=''
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(maliciousBookmark)
            })
            it('remove XSS attack content', ()=> {

            })
            
        })
    })

    describe('GET /bookmarks/:id', ()=> {
        context('Given no bookmark', ()=>{

        })
        context('Given there are bookmarks', ()=>{
            const testBookmarks= fixtures.makeBookmarksArray()
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
            
        })
        context('Given an XSS attack bookmark', ()=>{
            const maliciousBookmark=''
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(maliciousBookmark)
            })
            it('remove XSS attack content', ()=> {

            })
        })
    })

    describe('DELETE /bookmarks/:id', ()=> {
        context('Given no bookmark', ()=>{

        })
        context('Given there are bookmark', ()=>{
            const testBookmarks= fixtures.makeBookmarksArray()
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
        })
    })

    describe('POST /bookmarks', ()=> {
        it('400 if no title', ()=> {

        })
        it('400 if no url', ()=> {
            
        })
        it('400 if not a valid url', ()=> {
            
        })
        it('', ()=> {

        })
        it('', ()=> {
            
        })
        it('add a new bookmark to the store', ()=> {
            
        })


    //XSS, known as cross-site scripting. We can prevent XSS attacks by "sanitizing" the content in our reponse data, by (1) ESCAPING any potential script elements (2) suspicious JS in response data 

        it('remove XSS attack content from response', ()=> {
            
        })

    })

    describe('', ()=>{
        it('',()=>{
            return supertest(app)
            .get('/').expect(200,'Hello, boilerplate')})
    })
*/
})