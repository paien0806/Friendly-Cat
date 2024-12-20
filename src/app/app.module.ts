import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SearchFoodModule } from './search-food/search-food.module';
import { DisplayComponent } from './searchfood/new-search/display/display.component';
@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SearchFoodModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
