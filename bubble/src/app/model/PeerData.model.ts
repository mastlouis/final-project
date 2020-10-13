export class PeerData {
  peer: any;
  audio: any;
  video: any;

  constructor(peer: any, audio=null, video=null) {
    this.peer = peer;
    this.audio = audio;
    this.video = video;
  }
}
