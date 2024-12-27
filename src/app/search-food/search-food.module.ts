import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 用於雙向綁定 [(ngModel)]
import { ReactiveFormsModule } from '@angular/forms';

// 导入 Angular Material 模块
import { MatFormFieldModule } from '@angular/material/form-field';  // 用于 form-field
import { MatSelectModule } from '@angular/material/select';  // 用于下拉選單
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin'; // 加載的 spinner

import { RoundPipe } from '../pipes/round.pipe';
import { EmptyInfoPipe } from '../pipes/empty-info.pipe';

import { DisplayComponent } from './new-search/display/display.component';
import { NewSearchComponent } from './new-search/new-search.component';

@NgModule({
  declarations: [
    DisplayComponent,
    NewSearchComponent,
    RoundPipe,
    EmptyInfoPipe
  ],
  imports: [
    CommonModule,
    FormsModule, // 支援 [(ngModel)]
    MatFormFieldModule,  // 新增
    MatSelectModule,     // 新增
    ReactiveFormsModule,
    NzSelectModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule
  ]
})
export class SearchFoodModule { }
