import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ManualComponent } from "./components/manual/manual.component";
import { PreprocessingComponent } from "./components/preprocessing/preprocessing.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "manual",
    pathMatch: "prefix",
  },
  {
    path: "manual",
    component: ManualComponent,
  },
  {
    path: "preprocessing",
    component: PreprocessingComponent,
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
export class AnalysisRoutingModule {}
