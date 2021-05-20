const express = require('express')
const { ExpressPeerServer } = require('peer');
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const { v4: uuid } = require('uuid')

const PORT = process.env.PORT || 3000

//WIP user ID, matching, chat, ...
const users = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

//hosting peer on url/peerjs
const peerServer = ExpressPeerServer(server, {
    debug: true,
    port: PORT,
});
app.use('/peerjs', peerServer);

//generate unique id on request
app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`)
})

//render room.ejs
app.get('/:id', (req, res) => {
    res.render('room', { roomId: req.params.id })
})

io.on('connection', socket => {
    //waiting for emits from script
    socket.on('join-room', (roomId, userId) => {
        const profile = [{
            id: userId,
            video: true, 
            audio: true
        }] //WIP

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

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))
