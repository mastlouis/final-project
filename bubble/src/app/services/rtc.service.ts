import { Injectable } from '@angular/core';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  self: any;
  peers: any[] = [];

  constructor() {
    this.self = new SimplePeer({initiator: true});
    this.peers.push(new SimplePeer());
    this.test();
  }

  test() {
    this.self.on('signal', data => {
      // when peer1 has signaling data, give it to peer2 somehow
      this.peers[0].signal(data)
    })

    this.peers[0].on('signal', data => {
      // when peer2 has signaling data, give it to peer1 somehow
      this.self.signal(data)
    })

    this.self.on('connect', () => {
      // wait for 'connect' event before using the data channel
      this.self.send('hey peer2, how is it going?')
    })

    this.peers[0].on('data', data => {
      // got a data channel message
      console.log('got a message from peer1: ' + data)
    })
  }
}
