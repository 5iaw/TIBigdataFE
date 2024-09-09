import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConnectionComponent } from "./components/connection/connection.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "middleware",
    pathMatch: "full",  // Ensure this redirects only when the path is exactly ""
  },
  {
    path: "middleware",
    component: ConnectionComponent,  // Route for your keyword search
  },
  // Optional: Catch-all route for unknown paths (404 handling)
  {
    path: "**",
    redirectTo: "middleware",  // Redirect to the middleware component for any unknown paths
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiddlewareRoutingModule {}
