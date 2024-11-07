import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConnectionComponent } from "./components/connection/connection.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "analysis",
    pathMatch: "prefix",
  },
  // {
  //   path: "fileupload",
  //   component: FileUploadComponent,
  // },
  // {
  //   path: "es",
  //   component: ElasticSearchComponent,
  // },
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
