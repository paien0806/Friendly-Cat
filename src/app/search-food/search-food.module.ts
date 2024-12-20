import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 用於雙向綁定 [(ngModel)]

// 导入 Angular Material 模块
import { MatFormFieldModule } from '@angular/material/form-field';  // 用于 form-field
import { MatSelectModule } from '@angular/material/select';  // 用于下拉選單
import { MatOptionModule } from '@angular/material/core';  // 用于 mat-option
import { MatInputModule } from '@angular/material/input';  // 用于 mat-label 和其他输入框功能


import { DisplayComponent } from './new-search/display/display.component';
import { NewSearchComponent } from './new-search/new-search.component';

@NgModule({
  declarations: [
    DisplayComponent,
    NewSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // 支援 [(ngModel)]
    MatFormFieldModule,  // 新增
    MatSelectModule,     // 新增
    MatOptionModule,     // 新增
    MatInputModule       // 新增
  ]
})
export class SearchFoodModule { }
