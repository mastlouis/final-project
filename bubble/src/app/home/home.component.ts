import { Component, HostListener, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';
import { Rtc2Service } from '../services/rtc2.service';
import { Tile } from '../model/Tile.model';
import { Bubble } from '../model/Bubble.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import * as socketio from "socket.io";
import { Socket } from 'socket.io';

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  audio: any = null;
  video: any = null;
  mirror = true;
  focus: number = null;
  numCols = 1;
  bubbles: Bubble[] = [
    { name: 'one' },
    { name: 'two' },
    { name: 'three' },
  ]
  you: Tile = { text: 'You', cols: 1, rows: 1, color: 'lightblue', index: 0 };
  tiles: Tile[] = [
    this.you,
    { text: '1', cols: 1, rows: 1, color: 'lightblue', index: 1 },
    { text: '2', cols: 1, rows: 1, color: 'lightgreen', index: 2 },
    { text: '3', cols: 1, rows: 1, color: 'lightpink', index: 3 },
    { text: '4', cols: 1, rows: 1, color: 'lavender', index: 4 },
  ]
  newBubbleForm = this._fb.group({
    newBubble: [''],
  });

  constructor(
    private _rtc: RtcService,
    private _fb: FormBuilder,
    private _rtc2: Rtc2Service,
    private _socket: Socket
  ) { }

  ngOnInit(): void {
    this.numCols = Math.floor(window.innerWidth / 320);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.numCols = Math.floor(event.target.innerWidth / 320);
    this.tiles[0].cols = this.numCols;
  }

  drop(event: CdkDragDrop<Bubble[]>) {
    moveItemInArray(this.bubbles, event.previousIndex, event.currentIndex);
  }

  toggleAudio() {
    if (this.audio) {
      this._rtc.removeSelfAudio();
      this.audio = null;
    }
    else {
      this._rtc.connectSelfAudio();
      this.audio = this._rtc.self.audio;
    }
  }

  toggleVideo() {
    if (this.video) {
      this._rtc.removeSelfVideo();
      this.video = null;
      let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
      pageVideo.srcObject = null;
      pageVideo.play()
    }
    else {
      this._rtc.connectSelfVideo();
      this.video = this._rtc.self.video;
      let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
      pageVideo.srcObject = this.video;
      pageVideo.play()
    }
  }

  addTile() {
    this.tiles.push({
      text: `${this.tiles.length + 1}`,
      cols: 1,
      rows: 1,
      color: 'lavender',
      index: this.tiles.length
    } as Tile)
  }

  refocus(i: number) {
    this.unfocus();
    this.focus = i;
    this.tiles[i].cols = this.numCols;
    this.tiles[i].rows = 2;
    let temp = this.tiles[i];
    this.tiles.splice(0, 0, this.tiles.splice(i, 1)[0]);
  }

  unfocus() {
    if (this.focus === null) {
      return;
    }
    this.tiles[0].cols = 1;
    this.tiles[0].rows = 1;
    this.tiles.splice(this.focus, 0, this.tiles.splice(0, 1)[0]);
    this.focus = null;
  }

  addBubble(name: string = "") {
    if (!name) {
      if (!this.newBubbleForm.get("newBubble")) {
        return;
      }
      name = this.newBubbleForm.get("newBubble").value;
    }
    this.bubbles.push({
      name: name
    } as Bubble);
    this.newBubbleForm.get("newBubble").setValue('');
  }

  activateRTC() {
    this.video = this._rtc2.self.video;
    let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
    pageVideo.srcObject = this.video;
    pageVideo.play()
    for (let i = 0; i < this._rtc2.clients.length; i++) {
      if (this.tiles.length + 1 < this._rtc2.clients.length) {
        this.tiles.push({ text: `${i}`, cols: 1, rows: 1, color: 'lightblue', index: i } as Tile);
      }
      this.tiles[i + 1].stream = this._rtc2.clients[i].video;
      let clientVideo = document.querySelector(`.client-${i + 1}-video`) as HTMLVideoElement
      clientVideo.srcObject = this._rtc2.clients[i].video;
      clientVideo.play();
    }
  }

  debug() {
    debugger;
  }






    // DOM elements.
roomSelectionContainer = document.getElementById('room-selection-container') as unknown as HTMLCollectionOf<HTMLElement>
roomInput = document.getElementById('room-input')

videoChatContainer = document.getElementById('video-chat-container') as unknown as HTMLCollectionOf<HTMLElement>
localVideoComponent = document.getElementById('local-video')
remoteVideoComponent = document.getElementById('remote-video')

// Variables.
mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 },
}

localStream: any = null;
remoteStream: any = null;
isRoomCreator: boolean = null;
rtcPeerConnection: any = null; // Connection between the local device and the remote peer.
roomId: any = null;




// FUNCTIONS related to rooms==================================================================
joinRoom(room) {
  if (room === '') {
    alert('Please type a room ID')
  } else {
    this.roomId = room
    Socket.emit('join', room)
    //showVideoConference()
  }
}

showVideoConference() {
  this.roomSelectionContainer.style = 'display: none'
  this.videoChatContainer.style = 'display: block'
}


  async setLocalStream(mediaConstraints) {
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  } catch (error) {
    console.error('Could not get user media', error)
  }

  this.localStream = stream
  this.localVideoComponent = stream
}

addLocalTracks(rtcPeerConnection) {
  this.localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, this.localStream)
  })
}

  async createOffer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  Socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription,
    this: this.roomId,
  })
}

  async createAnswer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  Socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription,
    this: this.roomId,
  })
}

setRemoteStream(event) {
  this.remoteVideoComponent = event.streams[0]
  this.remoteStream = event.stream
}

sendIceCandidate(event) {
  if (event.candidate) {
    Socket.emit('webrtc_ice_candidate', {
      this: this.roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })
  }
}
// BUTTON LISTENER ============================================================
connectButton() {
  this.joinRoom(this.roomInput)
}










//socket stuff for rooms
justDoIt1(){


// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}



// SOCKET EVENT CALLBACKS =====================================================
Socket.on('room_created', async () => {
  console.log('Socket event callback: room_created')

  await this.setLocalStream(this.mediaConstraints)
  this.isRoomCreator = true
})

Socket.on('room_joined', async () => {
  console.log('Socket event callback: room_joined')

  await this.setLocalStream(this.mediaConstraints)
  Socket.emit('start_call', this.roomId)
})

Socket.on('full_room', () => {
  console.log('Socket event callback: full_room')

  alert('The room is full, please try another one')
})

Socket.on('start_call', async () => {
  console.log('Socket event callback: start_call')

  if (this.isRoomCreator) {
    this.rtcPeerConnection = new RTCPeerConnection(iceServers)
    this.addLocalTracks(this.rtcPeerConnection)
    this.rtcPeerConnection.ontrack = this.setRemoteStream
    this.rtcPeerConnection.onicecandidate = this.sendIceCandidate
    await this.createOffer(this.rtcPeerConnection)
  }
})

Socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')

  if (!this.isRoomCreator) {
    this.rtcPeerConnection = new RTCPeerConnection(iceServers)
    this.addLocalTracks(this.rtcPeerConnection)
    this.rtcPeerConnection.ontrack = this.setRemoteStream
    this.rtcPeerConnection.onicecandidate = this.sendIceCandidate
    this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    await this.createAnswer(this.rtcPeerConnection)
  }
})

Socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer')

  this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

Socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  this.rtcPeerConnection.addIceCandidate(candidate)
})


}






}










