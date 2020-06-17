/*Inject the Knex instance into the service, which means we keep the knex() calls inside the contoller file, and then use knexInstance as an variable
*/ 

const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: 'postgresql://dunder_mifflin:password-here@localhost/bookmarks'
})

knexInstance('')
    .select('*')
    .where({key: ''}) // = .where('name', ILIKE, `%${THINKFUL}%`)
    //.whereNotNull('columnName')
    //.first() // select the first item found
    //.limit()
    //.offset() //= (pageNumber-1)*10
    //.count()
    //.groupBy()
    //.orderBy([{column:'', order:'ASC/DESC'}])
    //.toQuery()
    .then(result=>console.log(result))

