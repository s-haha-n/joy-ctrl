import Peer from 'peerjs';

const peer = new Peer(); // Create a new PeerJS instance

peer.on('open', (id) => {
  console.log(`PeerJS ID: ${id}`);
  alert(`Your PeerJS ID: ${id}. Share this ID with the sender.`);
});

peer.on('call', (call) => {
  console.log('Incoming call...');
  call.answer(); // Answer the call without sending a stream

  call.on('stream', (remoteStream) => {
    console.log('Receiving video stream...');
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

  call.on('error', (err) => {
    console.error('Call error:', err);
  });
});

peer.on('error', (err) => {
  console.error('PeerJS error:', err);
});