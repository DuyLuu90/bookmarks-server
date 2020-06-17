/*We use "service" for database transaction (INSERT-SELECT-UPDATE-DELETE)
BENEFITS: easy to navigate, reusable, easy to update
BEST PRACTICES:
    DRY for using function (don't repeat yourself= reuse)
    SOC for organizing function
    "Modularization and layering" to structure files (move some codes out of our middleware)
    "Encapsulation": for bundling methods together (group together methods that perform related transactions)
*/ 

const BookmarksService = {
    // (GET /bookmarks) 
    getAllBookmarks(knex) {
        return knex('bookmarks').select('*') 
    },
    // (GET /bookmarks/:id)
    getById(knex,id) {
        return knex('bookmarks').select('*').where({id}).first()
    },
    // (POST /bookmarks/:id)
    insertBookmark(knex,newBookmark) {
        return knex.insert(newBookmark).into('bookmarks')
        .returning('*').then(rows=>rows[0])
    },
    // (DELETE /bookmarks/:id)
    deleteBookmark(knex,id) {
        return knex('bookmarks').where({id}).delete()
    },
    // (PATCH /bookmarks/:id)
    updateBookmark(knex,id,newBookmarkFields){
        return knex('bookmarks').where({id}).update(newBookmarkFields)
    }

}

module.exports=BookmarksService