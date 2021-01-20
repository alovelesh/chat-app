const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: +new Date()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        url,
        createdAt: +new Date(),
        username
    }
}

module.exports = { generateMessage, generateLocationMessage }