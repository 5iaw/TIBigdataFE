import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MiddlewareRoutingModule } from "./middleware-routing.module";
import { ConnectionComponent } from "./components/connection/connection.component"
import { SharedModule } from "src/app/shared/shared.module";
import {TranslateModule} from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';  // Import FormsModule
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule

@NgModule({
  declarations: [
    ConnectionComponent
  ],
    imports: [
      CommonModule, 
      MiddlewareRoutingModule, 
      SharedModule, 
      TranslateModule,
      FormsModule,
      HttpClientModule],
    exports: [ConnectionComponent]
})
export class MiddlewareModule {}
