// to save all the configuration of the application, to keep track the values defined in .env file

module.exports= {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
    DB_URL: process.env.DB_URL || 'postgresql://Duy:123@localhost/bookmarks'
}