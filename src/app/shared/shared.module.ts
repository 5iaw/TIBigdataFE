import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ArticleCardViewComponent } from "./component/article-card-preview/article-card-preview.component";
import { ArticleListComponent } from "./component/article-list/article-list.component";
import { RouteLocationComponent } from "./component/route-location/route-location.component";
import { SearchBarComponent } from "./component/search-bar/search-bar.component";
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    ArticleCardViewComponent,
    ArticleListComponent,
    SearchBarComponent,
    RouteLocationComponent,
  ],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  exports: [
    SearchBarComponent,
    ArticleListComponent,
    ArticleCardViewComponent,
    RouteLocationComponent,
  ],
  providers: [],
  bootstrap: [],
})
export class SharedModule { }
