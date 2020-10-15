import { Component, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';
import { WebsocketService } from "../websocket.service";
import { ChatService } from "../chat.service";

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [WebsocketService, ChatService]
})
export class HomeComponent implements OnInit {

  audio: any = null;
  video: any = null;
  mirror = true;

  constructor(private _rtc: RtcService, private chatService: ChatService) { 
    chatService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg);
    });
  }

  ngOnInit(): void {

  }
  private message = {
    author: "tutorialedge",
    message: "this is a test message"
  };

  sendMsg() {
    console.log("new message from client to websocket: ", this.message);
    this.chatService.messages.next(this.message);
    this.message.message = "";
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


  toggleVideo2() {
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

  tester(){
      this._rtc.testPeer();
      console.log("we sure tried");
  }
}
