import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {

  @Input() postalCode: string = '';  // 接收來自父組件的郵遞區號

  constructor() { }

  ngOnInit(): void {
  }

}
