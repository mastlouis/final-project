import { Component, HostListener, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';
import { Tile } from '../model/Tile.model';

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
  you: Tile = {text: 'You', cols: 1, rows: 1, color: 'lightblue', index: 0};
  tiles: Tile[] = [
    this.you,
    {text: '1', cols: 1, rows: 1, color: 'lightblue', index: 1},
    {text: '2', cols: 1, rows: 1, color: 'lightgreen', index: 2},
    {text: '3', cols: 1, rows: 1, color: 'lightpink', index: 3},
    {text: '4', cols: 1, rows: 1, color: 'lavender', index: 4},
  ]

  constructor(private _rtc: RtcService) { }

  ngOnInit(): void {
    this.numCols = Math.floor(window.innerWidth / 320);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.numCols = Math.floor(event.target.innerWidth / 320);
    this.tiles[0].cols = this.numCols;
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

}
