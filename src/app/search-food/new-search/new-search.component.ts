import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-search',
  templateUrl: './new-search.component.html',
  styleUrls: ['./new-search.component.scss']
})
export class NewSearchComponent implements OnInit {
  postalCode: string = '200';

  constructor() { }

  ngOnInit(): void {
  }
}
