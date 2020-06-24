const knex= require('knex')
const fixtures = require('./bookmarks-fixtures')
const app = require('../src/app')

describe('Bookmark service obj', ()=> {
    let db;
    const testBookmarks= fixtures.makeBookmarksArray() //use this array to represent valid content of our db
    before('make knex Instance', ()=> {
        db= knex({
            client: 'pg',
            connection: process.env.DB_URL}) 
        app.set('db', db)
    })
    
    before('cleanup', ()=>db('bookmarks').truncate()) // remove all of the data from the table
    afterEach('cleanup', ()=>db('bookmarks').truncate())
    after('disconnect from db', ()=> db.destroy())// go of db connection 
    
    describe.skip('Unauthorized request', ()=>{
        beforeEach('insert bookmarks',()=>{
            return db.into('bookmarks').insert(testBookmarks) 
        })
        //supertest(app): pass the express server obj and invoke the endpoint
        it('GET /api/bookmarks 401 unauthorized respond', ()=>{
            return supertest(app).get('/api/bookmarks')
                .expect(401,{error:'Unauthorized request'})
        })
        it('POST /api/bookmarks/ 401 unauthorized respond', ()=>{
            return supertest(app).post('/api/bookmarks')
                .expect(401,{error:'Unauthorized request'}) 
        })
        it('GET /api/bookmarks/:id 401 unauthorized respond', ()=>{
            return supertest(app).get('/api/bookmarks/1')
                .expect(401,{error:'Unauthorized request'})
        })
        it('PATCH /api/bookmarks/:id 401 unauthorized respond', ()=>{
            return supertest(app).patch('/api/bookmarks/1')
                .send({title:`updated-title`})
                .expect(401,{error:'Unauthorized request'})
        })
        it('DELETE /api/bookmarks/:id 401 unauthorized respond', ()=>{
            return supertest(app).delete('/api/bookmarks/1')
                .expect(401,{error:'Unauthorized request'})
        }) 
    }) 

    describe.skip('GET /api/bookmarks', ()=> {
        context('Given no bookmarks', ()=>{
            it(`respond with 200 and an empty list`, ()=>{
                return supertest(app).get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])
            })
        })
        context('Given there are bookmarks', ()=>{
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testBookmarks)
            })
            it(`get the bookmarks from the store`,()=>{
                return supertest(app).get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,testBookmarks)
            })
            
        })
    })

    describe.skip('GET /api/bookmarks/:id', ()=> {
        context('Given no bookmark', ()=>{
            it(`Respond 404 bookmark doesn't exist`,()=>{
                return supertest(app).get('/api/bookmarks/123')
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
                const expectdBookmark= testBookmarks[bookmarkId-1]
                return supertest(app).get(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,expectdBookmark)
            })    
        })
    })

    describe.skip('DELETE /api/bookmarks/:id', ()=> {
        it('return 404 when bookmark does not exist', ()=>{
            return supertest(app).delete(`/api/bookmarks/123456`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404,`Bookmark not found`)
        })
        it('remove the bookmark by ID from the store', ()=>{
            const bookmarkId=2
            const expectdBookmark= testBookmarks.filter(b=>b.id!==bookmarkId)
            return supertest(app).delete(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(()=>{
                    supertest(app).get(`/api/bookmarks`)
                    .expect(expectdBookmark)
                })
        })
    })

    describe.skip('POST /api/bookmarks', ()=> {
        
        const requiredFields = ['title','url','description']
        requiredFields.forEach(field=>{
            const newItem= {
                title: 'new title',
                url: `http://test.com`,
                description:`new description`}
            it(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                delete newItem[field]
                return supertest(app).post(`/api/bookmarks`)
                .send(newItem)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400,`${field} is required`)
            })
        })
        
        it.skip('add a new bookmark to the store', ()=> {
            const newBookmark= {
                title: 'test title',
                url: `http://test.com`, 
                description: `test description`,
            }
            return supertest(app).post(`/api/bookmarks`)
                .send(newBookmark)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res=>{
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                })
                .then(postRes=>{
                    supertest(app).get(`/api/bookmarks/${postRes.body.id}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
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
    describe.only(`PATCH /api/bookmarks/:id`,()=>{
        context('Given no bookmark',()=>{
            it('respond with 404',()=>{
                const bookmarkId=123456
                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404,{error:{message:`Bookmark doesn't exist`}})
            })
        })
        context.skip(`Given there are bookmark`,()=>{
            it(`respond with 400 when no required field supplied`,()=>{
                const bookmarkId=2
                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({irrelevantField:`foo`})
                    .expect(400,{
                        error: {
                            message: `Req body must contain either 'title','url',or'description'`
                        }
                    })
            })
            it('respond with 204 when updating only a subset',()=>{
                const bookmarkId=2
                const updatedBookmark = {
                    title: 'update bookmark title'
                }
                const expectedBookmark = {
                    ...testBookmarks[bookmarkId-1],
                    ...updatedBookmark
                }
                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({
                        ...updatedBookmark,
                        fieldToIgnore: `should not be in GET response`
                    })
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`/api/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(expectedBookmark))
            })
            it('respond with 204 and update the bookmark',()=>{
                const bookmarkId=2
                const updatedBookmark ={
                    title: `new title`,
                    url: `http://newwebsite.com`,
                    description: 'new description'
                }
                const expectedBookmark= {
                    ...testBookmarks[bookmarkId-1],
                    ...updatedBookmark
                }
                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(updatedBookmark)
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`/api/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(expectedBookmark))
            })
        })
    })
})