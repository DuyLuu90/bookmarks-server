const {uuid}= require('uuidv4')

const bookMarks= [
    {
        id: uuid(),
        title: 'Thinkful',
        url: 'thinkful.com',
        description: 'Thinkful Website'
    },
    {
        id: uuid(),
        title: 'FAA',
        url: 'faa.gov',
        description: 'Federal Aviation Administration'
    },
    {
        id: uuid(),
        title: 'Simple Flying',
        url: 'simpleflying.com',
        description: 'Aviation News and Insignt'
    }
]

module.exports = {bookMarks}