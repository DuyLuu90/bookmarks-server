const knex= require('knex')
const fixtures = require('./bookmarks-fixtures')
const app = require('../src/app')

describe('BOOKMARK ENDPOINTS', ()=> {
    let db;
    const testBookmarks= fixtures.makeBookmarksArray() //use this array to represent valid content of our db
    before('make knex Instance', ()=> {
        db= knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL}) 
        app.set('db', db)
    })
    
    before('cleanup', ()=>db('bookmarks').truncate()) // remove all of the data from the table
    afterEach('cleanup', ()=>db('bookmarks').truncate())
    after('disconnect from db', ()=> db.destroy())// go of db connection 
    
    describe('Given no valid token', ()=>{
        beforeEach('insert bookmarks',()=>{
            return db.into('bookmarks').insert(testBookmarks) 
        })
        const protectedEndpoints = [
            {name:`GET /api/bookmarks`,method:supertest(app).get,path:`/api/things/1`},
            {name:`POST /api/bookmarks`,method:supertest(app).post,path:`/api/bookmarks`},
            {name:`GET /api/bookmarks/:id`,method:supertest(app).get,path:`/api/bookmarks/1`},
            {name:`PATCH /api/bookmarks/:id`,method:supertest(app).patch,path:`/api/bookmarks/1`},
            {name:`DELETE /api/bookmarks/:id`,method:supertest(app).delete,path:`/api/bookmarks/1`},
        ]
        protectedEndpoints.forEach(endPoint=>{
            it(endPoint.name,()=>{
                return endPoint.method(endPoint.path)
              .expect(401,{error:`Unauthorized request`})
            })
        })
        //supertest(app): pass the express server obj and invoke the endpoint
    }) 
    describe(`GET /api/bookmarks`,()=>{
        context('Given no bookmark',()=>{
            it(`respond with 200 and an empty list`, ()=>{
                return supertest(app).get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })
        context(`Given there are bookmarks`,()=>{
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
            it(`GET all bookmarks`,()=>{
                return supertest(app).get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,testBookmarks)
            })
        })
    })
    
    describe('POST /api/bookmarks', ()=> {
        const requiredFields = ['title','url','description','rating']
        requiredFields.forEach(field=>{
            const newItem= {
                title: 'new title',
                url: `http://test.com`,
                description:`new description`,
                rating: 5}
            it(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                delete newItem[field]
                return supertest(app).post(`/api/bookmarks`)
                .send(newItem)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400,`${field} is required`)
            })
        })
        
        it('add a new bookmark to the store', ()=> {
            const newBookmark= {
                title: 'test title',
                url: `http://test.com`, 
                description: `test description`,
                rating: 5
            }
            return supertest(app).post(`/api/bookmarks`)
                .send(newBookmark)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res=>{
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes=>{
                    supertest(app).get(`/api/bookmarks/${postRes.body.id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(postRes.body)
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
    describe(`/api/bookmarks/:id`,()=>{
        beforeEach('insert bookmarks',()=>{
            return db.into('bookmarks').insert(testBookmarks)  
        })
        const path= '/api/bookmarks'
        const validId= 2
        const invalidId= 123456
        const bookmarkMethods=[
            {name:`GET bookmarkId ${invalidId}`,http:supertest(app).get},
            {name:`DELETE bookmarkId ${invalidId}`,http:supertest(app).delete},
            {name:`PATCH bookmarkId ${invalidId}`,http:supertest(app).patch},
        ]
        context('Given bookmark does not exist',()=>{
            bookmarkMethods.forEach(method=>{
                it(method.name,()=>{
                    return method.http(`${path}/${invalidId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404,{error:{message:`Bookmark not found`}})
                })
            })
        })
        context('Given bookmark does exist',()=>{
            it('GET bookmark',()=>{
                const expectedBookmark=testBookmarks[validId-1]
                return supertest(app).get(`/api/bookmarks/${validId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,expectedBookmark)
            })
            it('DELETE bookmark',()=>{
                const expectdBookmark= testBookmarks.filter(b=>b.id!==validId)
                return supertest(app).delete(`/api/bookmarks/${validId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .then(()=>{
                    supertest(app).get(`/api/bookmarks`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectdBookmark)
                })
            })
            describe('PATCH bookmark',()=>{
                const updatedBookmark ={
                    title: `new title`,
                    url: `http://newwebsite.com`,
                    description: 'new description'
                }
                it('respond with 400 when no required field supplied',()=>{
                    return supertest(app)
                    .patch(`/api/bookmarks/${validId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({irrelevantField:`foo`})
                    .expect(400,{
                        error: {
                            message: `Req body must contain either 'title','url',or'description'`
                        }
                    })
                })
                
                it('respond with 204 and update only a subset',()=>{
                    const updatedBookmark = {
                        title: 'update bookmark title'
                    }
                    const expectedBookmark = {
                        ...testBookmarks[validId-1],
                        ...updatedBookmark
                    }
                    return supertest(app)
                    .patch(`/api/bookmarks/${validId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({
                        ...updatedBookmark,
                        fieldToIgnore: `should not be in GET response`
                    })
                    .expect(200)
                    .then(res=>supertest(app)
                        .get(`/api/bookmarks/${validId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(expectedBookmark))
                })
                it('respond with 204 and update the bookmark',()=>{
                    const expectedBookmark= {
                        ...testBookmarks[validId-1],
                        ...updatedBookmark
                    }
                    return supertest(app)
                        .patch(`/api/bookmarks/${validId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(updatedBookmark)
                        .expect(200)
                        .then(res=>supertest(app)
                            .get(`/api/bookmarks/${validId}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmark))
                })
            })
        })
        
    })
})