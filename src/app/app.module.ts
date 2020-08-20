import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FooterComponent } from './modules/homes/footer/footer.component';
import { NavComponent } from './modules/homes/nav/nav.component';
import { MainHomeContainerComponent } from './modules/homes/body/main-home-container/main-home-container.component';
// import { HomeSearchBarComponent } from './modules/homes/body/main-home-container/home-search-bar/home-search-bar.component';
import { HomeGraphComponent } from './modules/homes/body/main-home-container/home-graph/home-graph.component';
import { TagCloudModule } from 'angular-tag-cloud-module';
import { LibraryModule } from './modules/homes/body/library/library.module';
import { WordcloudService } from './modules/homes/graphs/wordcloud/wordcloud.service';
// import { SearchBarComponent } from "./modules/homes/body/search/search-bar/search-bar.component";
import { EPAuthService } from './modules/communications/fe-backend-db/membership/auth.service';
import { SearchHistoryComponent } from './modules/homes/body/main-home-container/search-history/search-history.component';
import { AnalysisDatabaseService } from './modules/communications/fe-backend-db/analysis-db/analysisDatabase.service';

import { ChartsModule } from "ng2-charts";
import { BodyModule } from "./modules/homes/body/body.module";

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    NavComponent,
    MainHomeContainerComponent,
    // HomeSearchBarComponent,
    // SearchBarComponent,
    HomeGraphComponent,
    SearchHistoryComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BodyModule,
    FormsModule,
    TagCloudModule,
    LibraryModule,
    ChartsModule

  ],
  providers: [WordcloudService, EPAuthService, AnalysisDatabaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
