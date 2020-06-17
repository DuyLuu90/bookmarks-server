// server controller code: used to start the server listening and connect to db
const knex= require('knex')
const app= require('./app')
const {PORT, DB_URL} = require('./config')

//DB_URL= 'postgresql://dunder_mifflin:password-here@localhost/bookmarks'
const db = knex({
    client: 'pg',
    connection: DB_URL
})

app.set('db', db)
//the server needs to listen to a specific port so that port wil be correctly routed to the server
app.listen(PORT, ()=> {
    console.log(`Server listening at http://localhost:${PORT}`)
})
