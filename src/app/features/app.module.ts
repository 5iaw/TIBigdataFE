import { CommonModule } from "@angular/common";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { SocialLoginModule } from "angularx-social-login";
import { CoreModule } from "../core/core.module";
import { AuthGuard } from "../core/guards/auth-guard/auth.guard";
import { TokenInterceptorService } from "../core/interceptor/token-interceptor.service";
import { AuthenticationService } from "../core/services/authentication-service/authentication.service";
import { SharedModule } from "../shared/shared.module";
import { AboutKubicModule } from "./about-kubic/about-kubic.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AnalysisComponent } from "./article-analysis/components/analysis/analysis.component";
import { ArticleLibraryModule } from "./article-library/article-library.module";
import { CommunityBoardModule } from "./community-board/community.board.module";
import { HomePageComponent } from "./home-page/home-page.component";
import { MembershipModule } from "./memberships/membership.module";
import { SearchResultModule } from "./search-result/search-result.module";
import { UserpageModule } from "./userpage/userpage.module";
import { OpenApiModule } from "./open-api/open-api.module";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {ArticleLibraryComponent} from './article-library/components/article-library-root/article-library.component';
import {SearchBarComponent} from '../shared/component/search-bar/search-bar.component';

import {MiddlewareModule} from "./middleware/middleware.module";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent, HomePageComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      defaultLanguage: 'ko'
    }),
    CoreModule,
    SharedModule,
    SocialLoginModule,
    AboutKubicModule,
    ArticleLibraryModule,
    CommunityBoardModule,
    MembershipModule,
    SearchResultModule,
    UserpageModule,
    OpenApiModule,
    MiddlewareModule,
  ],
  exports: [],
  providers: [AuthGuard, AuthenticationService, TokenInterceptorService, ArticleLibraryComponent, SearchBarComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
