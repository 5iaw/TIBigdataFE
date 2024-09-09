import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../core/guards/auth-guard/auth.guard";
import { HomePageComponent } from "./home-page/home-page.component";

const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
  },
  {
    path: "mypage",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./userpage/userpage.module").then((m) => m.UserpageModule),
  },
  {
    path: "about",
    loadChildren: () =>
      import("./about-kubic/about-kubic.module").then(
        (m) => m.AboutKubicModule
      ),
  },
  {
    path: "membership",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./memberships/membership.module").then((m) => m.MembershipModule),
  },
  {
    path: "search",
    loadChildren: () =>
      import("./search-result/search-result.module").then(
        (m) => m.SearchResultModule
      ),
  },
  {
    path: "about",
    loadChildren: () =>
      import("./about-kubic/about-kubic.module").then(
        (m) => m.AboutKubicModule
      ),
  },
  {
    path: "community",
    loadChildren: () =>
      import("./community-board/community.board.module").then(
        (m) => m.CommunityBoardModule
      ),
  },
  {
    path: "library",
    loadChildren: () =>
      import("./article-library/article-library.module").then(
        (m) => m.ArticleLibraryModule
      ),
  },
  {
    path: "analysis-menu",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./article-analysis/analysis.module").then(
        (m) => m.AnalysisModule
      ),
  },
  {
    path: "userpage",
    loadChildren: () =>
      import("./userpage/userpage.module").then((m) => m.UserpageModule),
  },
  {
    path: "openapi",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./open-api/open-api.module").then(
        (m) => m.OpenApiModule
      ),
  },
  {
    path: "middleware",
    loadChildren: () =>
      import("./middleware/middleware.module").then(
        (m) => m.MiddlewareModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
