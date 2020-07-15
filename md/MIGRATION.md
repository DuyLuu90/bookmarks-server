#SETUP:
    INSTALL: npm i postgrator-cli@3.2.0 -D
    ./postgrator-config.js:

        require('dotenv').config();
        module.exports = {
            "migrationDirectory": "",
            "driver": "pg",
            "connectionString": (process.env.NODE_ENV === 'test')
                ? process.env.TEST_DB_URL
                : process.env.DB_URL
        }
TO CREATE DB:
    CREATE DATABASE <dbName> OWNER <roleName> ;
TO CREATE TABLE INTO A DATABASE
    psql -U <user/roleName> -d <dbName> -f <filePath> ||
    INSERT INTO <tableName> (columns) VALUES 
        (row 1),
        (row 2), ...
        (row n) ; 

        