import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainHomeContainerComponent } from './modules/homes/body/main-home-container/main-home-container.component';
import { BodyContainerComponent } from './modules/homes/body/body-container/body-container.component';

const routes: Routes = [
  {
    path: '',
    component : MainHomeContainerComponent
  },
  {
    path: 'homes',
    component : MainHomeContainerComponent
  },
  // { 
  //   path: 'body',
  //   component : BodyContainerComponent
  // },
  {
    path: 'search',
    loadChildren : ()=> import('./modules/homes/body/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'specials',
    loadChildren : ()=> import('./modules/homes/body/specials/specials.module').then(m => m.SpecialsModule)
  },
  {
    path : 'library',
    loadChildren : ()=> import('./modules/homes/body/library/library.module').then(m => m.LibraryModule)
  },
  // {
  //   path: 'specials',
  //   loadChildren: () => import('./modules/specials/specials.module').then(m => m.SpecialsModule)
  // },
  {
    path: 'membership',
    loadChildren: () => import('./modules/communications/communication.module').then(m => m.CommunicationModule),
    // canLoad : [AuthGuard]./modules/communications/communication.module
  },
  {
    path : 'community',
    loadChildren: () => import('./modules/homes/body/community/community.module').then(m => m.CommunityModule),
  }
 
 

  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
