import { Component, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  audio: any = null;
  video: any = null;
  mirror = true;

  constructor(private _rtc: RtcService) { }

  ngOnInit(): void {
  }

  startPage(){
    let rtcConnected = false;
    let Peer = new SimplePeer;
    let ws, msgs = []
      let p = null;
 
      const socketReady = new Promise( (resolve, reject) => {
        ws = new WebSocket(`ws://127.0.0.1:4200`);
 
        ws.onopen = () => {
 
          ws.onmessage = __msg => {
            const msg = JSON.parse( __msg.data )
            if( msg.address === 'connect' )  {
              resolve( msg.initiator )
            }else{
              p.signal( msg );
            }
          };
        };
 
    })
 
    console.log("made it here");
    const makeConnection = function(initiator) {
      console.log("making connection");
      ws.send( initiator );
    };
 
     // get video/voice stream as Promise
     const avReady = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
 
      Promise.all( [avReady, socketReady] ).then( values => {
        const stream = values[0];
 
        p = new Peer({
          initiator: values[1],
          trickle: false,
          stream
        });
 
        p.on("signal", data => {
          makeConnection( JSON.stringify(data) );
        });
 
        p.on("stream", stream => {
          // got remote video stream, now let's show it in a video tag
          var video = document.querySelector("#their-video") as HTMLVideoElement;
 
          if ("srcObject" in video) {
            video.srcObject = stream;
          } else {
            // video. = window.URL.createObjectURL(stream);
          }
 
          console.log("made it here")
          video.play()
        })
      })
    }
    

      
  toggleAudio() {
    if(this.audio) {
      this._rtc.removeSelfAudio();
      this.audio = null;
    }
    else {
      this._rtc.connectSelfAudio();
      this.audio = this._rtc.self.audio;
    }
  }

  toggleVideo() {
    if(this.video) {
      this._rtc.removeSelfVideo();
      this.video = null;
      let pageVideo = document.querySelector("#your-video") as HTMLVideoElement;
      pageVideo.srcObject = null;
      pageVideo.play()
    }
    else {
      this._rtc.connectSelfVideo();
      this.video = this._rtc.self.video;
      let pageVideo = document.querySelector("#your-video") as HTMLVideoElement;
      pageVideo.srcObject = this.video;
      pageVideo.play()
    }
  }

}
