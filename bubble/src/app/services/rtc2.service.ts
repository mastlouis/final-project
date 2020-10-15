import { Injectable } from '@angular/core';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';
import { PeerData } from '../model/PeerData.model';

@Injectable({
  providedIn: 'root'
})
export class Rtc2Service {
  self: PeerData;
  clients: PeerData[] = [];
  ws: WebSocket;

  constructor() {
    this.setUpEverything();
  }

  getVideo() {
    return this.self.video;
  }

  setUpEverything() {
    let rtcConnected = false;
    let p = null;

    const socketReady = new Promise((resolve, reject) => {
      let constr = null;
      constr = `wss://${window.location.host}`;
      if (window.location.hostname === "localhost"){
        constr = `ws://${window.location.host}`;
      }
      this.ws = new WebSocket(constr);

      this.ws.onopen = () => {

        this.ws.onmessage = __msg => {
          const msg = JSON.parse(__msg.data)
          if (msg.address === 'connect') {
            resolve(msg.initiator)
          } else {
            p.signal(msg);
          }
        };
      };
    });

    // get video/voice stream as Promise
    const avReady = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const makeConnection = function (initiator) {
      console.log("making connection");
      this.ws.send(initiator);
    };

    Promise.all([avReady, socketReady]).then(values => {
      const stream = values[0];

      this.self.peer = new SimplePeer({
        initiator: values[1],
        trickle: false,
        stream
      });

      this.self.peer.on("signal", data => {
        makeConnection(JSON.stringify(data));
      });

      this.self.peer.on("stream", stream => {
        // got remote video stream, now let's show it in a video tag
        // var video = document.querySelector("video") as HTMLVideoElement;

        // video.srcObject = stream;

        // video.play();
        this.self.video = stream;
      })
    })
  }
}
