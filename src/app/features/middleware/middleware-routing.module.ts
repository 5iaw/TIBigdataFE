import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConnectionComponent } from "./components/connection/connection.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { UploadComponent } from "./components/upload/upload.component"; // Include any additional components
import { TransferComponent } from "./components/transfer/transfer.component"; // Example component
import { FileListComponent } from './components/file-list/file-list.component';

const routes: Routes = [
  {
    path: "", // Default path for this feature module
    redirectTo: "analysis", // Redirects to 'analysis' by default
    pathMatch: "full", // Use 'full' to ensure exact match
  },
  {
    path: "analysis", // Route for Analysis component
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
    path: "list-files", // Route for Transfer component (if needed)
    component: FileListComponent,
  },
  // Uncomment and add more routes as needed
  // {
  //   path: "fileupload",
  //   component: FileUploadComponent,
  // },
  // {
  //   path: "es",
  //   component: ElasticSearchComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Use RouterModule.forChild in feature modules
  exports: [RouterModule],
})
export class MiddlewareRoutingModule {}
