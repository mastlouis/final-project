import { Component, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private _rtc: RtcService) { }

  ngOnInit(): void {
  }

}
