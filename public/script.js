const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
var myStream
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
    myStream = stream

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, )
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
    const wrapper = document.createElement("div")
    wrapper.className = "video-wrapper"
    wrapper.append(video)

    videoGrid.append(wrapper)
}

// controls

function handleMicrophone() {
    if (controls.microphone == true) {
        // mute
        myStream.getAudioTracks()[0].enabled = false
        controls.microphone = false
        document.getElementById("mic-button-icon").innerHTML = "mic_off"
        document.getElementById("mic-button").title = "Unmute"

    }
    else {
        //unmute
        myStream.getAudioTracks()[0].enabled = true
        controls.microphone = true
        document.getElementById("mic-button-icon").innerHTML = "mic"
        document.getElementById("mic-button").title = "Mute"
    }
}

function handleVideocam() {
    if (controls.videocam == true) {
        // mute
        myStream.getVideoTracks()[0].enabled = false
        controls.videocam = false
        document.getElementById("cam-button-icon").innerHTML = "videocam_off"
        document.getElementById("cam-button").title = "Turn Video On"
    }
    else {
        //unmute
        myStream.getVideoTracks()[0].enabled = true
        controls.videocam = true
        document.getElementById("cam-button-icon").innerHTML = "videocam"
        document.getElementById("cam-button").title = "Turn Video Off"
    }
}
