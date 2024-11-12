import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConnectionComponent } from "./components/connection/connection.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { ElasticSearchComponent } from "./components/elasticsearch/elasticsearch.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "search",
    pathMatch: "prefix",
  },
  // {
  //   path: "fileupload",
  //   component: FileUploadComponent,
  // },
  {
    path: "search",
    component: ElasticSearchComponent,
  },
  {
    path: "analysis",
    component: AnalysisComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiddlewareRoutingModule {}
