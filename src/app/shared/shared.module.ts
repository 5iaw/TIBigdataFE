import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ArticleCardViewComponent } from "./component/article-card-preview/article-card-preview.component";
import { ArticleListComponent } from "./component/article-list/article-list.component";
import { RouteLocationComponent } from "./component/route-location/route-location.component";
import { SearchBarComponent } from "./component/search-bar/search-bar.component";
import {TranslateModule} from '@ngx-translate/core';
import { FileListComponent } from '../features/middleware/components/file-list/file-list.component';

@NgModule({
  declarations: [
    ArticleCardViewComponent,
    ArticleListComponent,
    SearchBarComponent,
    RouteLocationComponent,
    FileListComponent
  ],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  exports: [
    SearchBarComponent,
    ArticleListComponent,
    ArticleCardViewComponent,
    RouteLocationComponent,
    FileListComponent
  ],
  providers: [],
  bootstrap: [],
})
export class SharedModule { }
