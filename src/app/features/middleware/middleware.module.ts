import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MiddlewareRoutingModule } from "./middleware-routing.module";
import { ConnectionComponent } from "./components/connection/connection.component"
import { AnalysisComponent } from "./components/analysis/analysis.component"
import { SharedModule } from "src/app/shared/shared.module";
import {TranslateModule} from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';  // Import FormsModule
import { ElasticSearchComponent } from "./components/elasticsearch/elasticsearch.component";
import { HttpClientModule } from '@angular/common/http';
import { UploadComponent } from './components/upload/upload.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { TransferComponent } from './components/transfer/transfer.component';  // Import HttpClientModule

@NgModule({
  declarations: [
    ConnectionComponent,
    AnalysisComponent,
    ElasticSearchComponent,
    UploadComponent,
    FileListComponent,
    TransferComponent
  ],
    imports: [
      CommonModule,
      MiddlewareRoutingModule,
      SharedModule,
      TranslateModule,
      FormsModule,
      HttpClientModule,
      FormsModule],
    // exports: [ConnectionComponent, MiddlewareRoutingModule]
})
export class MiddlewareModule {}
