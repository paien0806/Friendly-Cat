import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewSearchComponent } from './search-food/new-search/new-search.component';
import { LoginPageComponent } from './components/login-page/login-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' }, // 空路徑時重定向到 /search
  { path: 'search', component: NewSearchComponent },      // 搜索頁面
  { path: 'login', component: LoginPageComponent },       // 登入頁面
  { path: '**', redirectTo: '/search' },                  // 其他所有路徑重定向到 /search
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
