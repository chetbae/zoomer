const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
var myStream
// const myStream
const peers = {}
const controls = {
    microphone: true,
    videocam: true,

}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myStream = stream
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play() 
    })
    videoGrid.append(video)
}

// controls

function handleMicrophone() {
    let node = document.getElementById("mic-button-icon")
    if (controls.microphone == true) {
        // mute
        controls.microphone = false
        node.innerHTML = "mic_off"
    }
    else {
        //unmute
        controls.microphone = true
        node.innerHTML = "mic"
    }
}

function handleVideocam() {
    let node = document.getElementById("cam-button-icon")
    if (controls.videocam == true) {
        // mute
        controls.videocam = false
        node.innerHTML = "videocam_off"
    }
    else {
        //unmute
        controls.videocam = true
        node.innerHTML = "videocam"
    }
}
