/*We use "service" for database transaction (INSERT-SELECT-UPDATE-DELETE)
BENEFITS: easy to navigate, reusable, easy to update
BEST PRACTICES:
    DRY for using function (don't repeat yourself= reuse)
    SOC for organizing function
    "Modularization and layering" to structure files (move some codes out of our middleware)
    "Encapsulation": for bundling methods together (group together methods that perform related transactions)
*/ 

const BookmarksService = {
    getAllBookmarks(knex) {
        return knex('bookmarks').select('*') 
    },
    getById(knex,id) {
        return knex('bookmarks').select('*').where({id}).first()
    },
    insertBookmark(knex,newBookmark) {
        return knex.insert(newBookmark).into('bookmarks')
        .returning('*').then(rows=>rows[0])
    },
    deleteBookmark(knex,id) {
        return knex('bookmarks').where({id}).delete()
    },
    updateBookmark(knex,id,newBookmarkFields){
        return knex('bookmarks').where({id}).update(newBookmarkFields)
    }

}

module.exports=BookmarksService