import { Injectable } from '@angular/core';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';
import { PeerData } from '../model/PeerData.model';
import { UsersInRoomResponse } from '../model/UsersInRoomResponse.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Rtc2Service {
  self: PeerData;
  clients: PeerData[] = [];
  ws: WebSocket;
  id: string = null;

  constructor(private http: HttpClient) {
    this.setUpEverything();
  }

  getVideo() {
    return this.self.video;
  }

  getClients(bubbleName) {
    return this.http.post('usersInRoom', {
      bubbleName
    });
  }

  resetPeers(bubbleName) {
    this.getClients(bubbleName).subscribe({
      next: (response: UsersInRoomResponse) => {
        if(!this.id && response.id) {
          this.id = response.id;
        }
        if(this.clients.length) {
          // TODO: Destroy all clients
          this.clients = [];
        }
        for(let i = 0; i < response.listOfClients.length; i++) {
          let newPeer = new SimplePeer();

          newPeer.on('signal', data => {

          });
          // Make a new peer
          // When a 'signal' offer is generated, send the server the id
          // of the client who should receive the offer
            // That way each client knows who made every request
        }
      },
      error: err => {

      }
    })
  }

  setUpEverything() {
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
            this.self.peer.signal(msg);
          }
        };
      };
    });

    // get video/voice stream as Promise
    const avReady = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    Promise.all([avReady, socketReady]).then(values => {
      const stream = values[0];

      this.self = new PeerData(new SimplePeer({
        initiator: values[1],
        trickle: false,
        stream
      }));
      this.self.video = stream;

      this.self.peer.on("signal", data => {
        console.log("making connection");
        this.ws.send(JSON.stringify(data));
      });

      this.self.peer.on("stream", stream => {
        let pd = new PeerData(new SimplePeer({
          initiator: false,
          stream
        }));
        pd.video = stream;
        this.clients.push(pd);

        // Remove from array when connection closes???
        pd.peer.on("close", () => {
          for (let i = 0; i < this.clients.length; i++){
            if (this.clients[i] === pd) {
              this.clients.splice(i, 1);
            }
          }
        });
      });
    });
  }
}
