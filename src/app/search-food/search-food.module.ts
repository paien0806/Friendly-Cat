import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewSearchComponent } from './new-search/new-search.component';
import { DisplayComponent } from './new-search/display/display.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';  // 導入 NzTypographyModule


@NgModule({
  declarations: [
    NewSearchComponent,
    DisplayComponent,
  ],
  imports: [
    CommonModule,
    NzTypographyModule
  ]
})
export class SearchFoodModule { }
