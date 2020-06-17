require('dotenv').config();

const value1= process.env.TEST_DB_URL;
const value2= process.env.DB_URL;

module.exports = {
    "migrationDirectory": "",
    "driver": "pg",
    "connectionString": (process.env.NODE_ENV === 'test')
        ? value1
        : value2
}

