const winston= require('winston')
const { NODE_ENV} = require('./config')

//info.log
//logger methods (gg npm winston)
//Winston is a popular and robust logging lib used to log all failures
//Winston's six level of severity: silly, debug, verbose,info, warn and error
const logger= winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({filename:'info.log'})
    ]
})

//Conditional statement here
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}
 
module.exports= logger
