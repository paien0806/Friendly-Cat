import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewSearchComponent } from './new-search/new-search.component';
import { DisplayComponent } from './new-search/display/display.component';
import { ChildSearchComponent } from './new-search/child-search/child-search.component';



@NgModule({
  declarations: [
    NewSearchComponent,
    DisplayComponent,
    ChildSearchComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SearchFoodModule { }
