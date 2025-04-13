import { Peer, DataConnection, MediaConnection } from 'peerjs';

class PeerJsCanvasStreamer {
  private peer: Peer;
  private connection: DataConnection | null = null;
  private call: MediaConnection | null = null;

  constructor(peerId: string, canvas: HTMLCanvasElement) {
    this.peer = new Peer();

    this.peer.on('open', () => {
      console.log(`Peer connected with ID: ${this.peer.id}`);
      this.connectToPeer(peerId, canvas);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error:', err);
    });
  }

  private connectToPeer(peerId: string, canvas: HTMLCanvasElement) {
    // Establish a data connection
    this.connection = this.peer.connect(peerId);

    this.connection.on('open', () => {
      console.log('Data connection established with peer:', peerId);

      // Once the data connection is open, initiate a media call
      const stream = canvas.captureStream(30); // Capture canvas stream at 30 FPS
      this.call = this.peer.call(peerId, stream);

      this.call?.on('error', (err) => {
        console.error('Error during call:', err);
      });
    });

    this.connection.on('error', (err) => {
      console.error('Data connection error:', err);
    });
  }
}

export default PeerJsCanvasStreamer;