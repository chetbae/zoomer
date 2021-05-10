const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuid } = require('uuid')

const users = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        const profile = [{
            id: userId,
            video: true, 
            audio: true
        }]

        if (users[roomId]) {
            users[roomId].push(profile)
        }  
        else {
            users[roomId] = [profile]
        } 

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)

            users[roomId].splice(users[roomId].indexOf(profile), 1)
            if (users[roomId].length == 0) 
                delete users[roomId]
        })
    })
})

server.listen(process.env.PORT || 3000)
