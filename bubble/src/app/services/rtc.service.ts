import { Injectable } from '@angular/core';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';
import { PeerData } from '../model/PeerData.model';

/* START OF WEB SOCKET CHANGES */
// import * as http from 'http';
import * as WebSocket from 'ws';
// import * as Exp from 'express'

// const app = Exp.express();

// const server = http.createServer( app )

// const socketServer = new WebSocket.Server({ server })

// // create a list of clients
// const clients = []

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  self: any;
  clients: PeerData[] = [];

  constructor() {
    this.self = new PeerData( new SimplePeer({initiator: true}) );
    // this.test();
  }

  addPeer() {
    let newPeer = new SimplePeer();
    newPeer.on('signal', data => {
      this.self.peer.signal(data);
    });
    this.self.peer.on('signal', data => {
      newPeer.signal(data);
    });
    this.clients.push(new PeerData(newPeer));
  }

  // connectOther(){

  //   let rtcConnected = false, Peer = SimplePeer, p = null;

  //       const socketReady = new Promise( (resolve, reject) => {
  //         let sock = new WebSocket(`wss://${window.location.host}`);

  //         sock.onopen = () => {

  //           sock.onmessage = __msg => {
  //             const msg = JSON.parse( __msg.data )
  //             if( msg.address === 'connect' )  {
  //               resolve( msg.initiator )
  //             }else{
  //               p.signal( msg );
  //             }
  //           };
  //         };
  //       });
  // }

  connectSelf(audio: boolean, video: boolean) {
    navigator.mediaDevices.getUserMedia({
      video: video,
      audio: audio
    }).then((stream) => this.self.peer.addStream(stream)).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  connectSelfVideo() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then((stream) => {
      this.self.peer.addStream(stream);
      this.self.video = stream;
    }).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  connectSelfAudio() {
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then((stream) => {
      this.self.peer.addStream(stream);
      this.self.audio = stream;
    }).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  removeSelfAudio() {
    this.self.peer.removeStream(this.self.audio);
  }

  removeSelfVideo() {
    this.self.peer.removeStream(this.self.video);
  }

  getPeerVideo(i: number) {
    this.clients[i].peer.on('stream', stream => {
      this.clients[i].video = stream;
    });
  }

  testPeer() {
    this.addPeer();

    this.self.peer.on('connect', () => {
      // wait for 'connect' event before using the data channel
      this.self.peer.send('hey peer2, how is it going?');
    });

    this.clients[0].peer.on('data', data => {
      // got a data channel message
      console.log('got a message from peer1: ' + data);
    });
  }
}
