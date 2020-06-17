/* 
process.env.TZ='UTC'
process.env.NODE_ENV= 'test'
*/

require('dotenv').config() // to make sure the env var are loaded when we run test

/* ASSERTIONS(library, used along with Mocha.):
to.deep.equal : to compare the prop and val of the obj = to.eql
.a : check the type of a value
*/
const { expect} = require('chai') //= const expect = require('chai').expect;
const supertest= require('supertest')

global.expect= expect
global.supertest= supertest