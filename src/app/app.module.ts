import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { SearchFoodModule } from './search-food/search-food.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmptyInfoPipe } from './pipes/empty-info.pipe';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

@NgModule({ declarations: [
        AppComponent,
        MessageDialogComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        SearchFoodModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatButtonModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
