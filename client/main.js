import Peer from 'peerjs';

const configuration = {
  iceServers: [
    {
      urls: "stun:146.190.38.66:3478",
    },
    {
      urls: "turn:146.190.38.66:3478",
      username: "gachet",
      credential: "gachet",
    },
  ],
};

const peer = new Peer(null, {
  debug: 3, // Enable detailed PeerJS debugging logs
  config: configuration, // Pass the custom ICE server configuration
});

peer.on('open', (id) => {
  console.log(`PeerJS ID: ${id}`);
  alert(`Your PeerJS ID: ${id}. Share this ID with the sender.`);
});

peer.on('call', (call) => {
  console.log('Incoming call:', call);
  call.answer(); // Answer the call without sending a stream

  call.on('stream', (remoteStream) => {
    console.log('Receiving video stream:', remoteStream);
    const video = document.createElement('video');
    video.srcObject = remoteStream;
    video.play();

    const canvas = document.getElementById('videoCanvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('play', () => {
      function drawFrame() {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      }
      drawFrame();
    });
  });

  call.on('iceStateChanged', (state) => {
    console.log('ICE state changed:', state);
  });

  call.on('error', (err) => {
    console.error('Call error:', err);
  });
});

peer.on('connection', (conn) => {
  console.log('Data connection established:', conn);
});

peer.on('disconnected', () => {
  console.log('Peer disconnected');
});

peer.on('close', () => {
  console.log('Peer connection closed');
});

peer.on('error', (err) => {
  console.error('PeerJS error:', err);
});