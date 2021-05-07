const socket = io('/')

socket.emit('join-room', ROOM_ID, 11)

socket.on('user-connected', userId => {
    console.log('user connected: ' + userId)
})