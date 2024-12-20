import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewSearchComponent } from './search-food/new-search/new-search.component';

const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },  // 設置默認路由
  { path: 'search', component: NewSearchComponent },  // 配置導航到 StockListComponent
  // 如果有其他路由，可以繼續加上
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
