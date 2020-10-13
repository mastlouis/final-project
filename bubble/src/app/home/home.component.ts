import { Component, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  audio = false;
  video = false;

  constructor(private _rtc: RtcService) { }

  ngOnInit(): void {
  }

  toggleAudio() {
    this.audio = !this.audio;
    this._rtc.connectSelf(this.audio, this.video);

  }

  toggleVideo() {
    this.video = !this.video;
    this._rtc.connectSelf(this.audio, this.video);
  }

}
