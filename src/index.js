const path = require('path')
const http = require('http')

const socketio = require('socket.io')
const express = require('express')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))

            io.to(user.room).emit('roomsData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('join', ({username, room}, cb) => {
        const res = addUser({id: socket.id, username, room})
        
        if (res.error) {
            return cb(res.error)
        }
         
        socket.join(res.user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(res.user.room).emit('message', generateMessage('Admin', `${res.user.username} has joined!`))

        io.to(res.user.room).emit('roomsData', {
            room: res.user.room,
            users: getUsersInRoom(res.user.room)
        })

        cb()
    })

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, message))
            cb()
        }
    })

    socket.on('sendlocation', (location) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('location', generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
        }
    })
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}.`)
})