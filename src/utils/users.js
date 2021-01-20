const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate user
    if (!(users && room)) {
        return {
            error: 'Username and room are required!'
        }
    }

    // check existing
    const existingUser = users.find(user => user.room === room && user.username === username)
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex > -1) {
        return users.splice(userIndex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}