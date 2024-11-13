import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConnectionComponent } from "./components/connection/connection.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { ElasticSearchComponent } from "./components/elasticsearch/elasticsearch.component";

import { SearchResultModule } from "../search-result/search-result.module";
import { UploadComponent } from "./components/upload/upload.component"; // Include any additional components
import { TransferComponent } from "./components/transfer/transfer.component"; // Example component
import { FileListComponent } from "./components/file-list/file-list.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "analysis",
    pathMatch: "prefix",
  },
  {
    path: "search",
    component: ElasticSearchComponent,
  },
  {
    path: "analysis",
    component: AnalysisComponent,
  },
  {
    path: "connection", // Route for Connection component
    component: ConnectionComponent,
  },
  {
    path: "upload", // Route for Upload component (if needed)
    component: UploadComponent,
  },
  {
    path: "transfer", // Route for Transfer component (if needed)
    component: TransferComponent,
  },

  {
    path: "file-list", // Route for Transfer component (if needed)
    component: FileListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Use RouterModule.forChild in feature modules
  exports: [RouterModule],
})
export class MiddlewareRoutingModule {}
