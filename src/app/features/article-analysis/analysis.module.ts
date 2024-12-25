import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AnalysisRoutingModule } from "./analysis-routing.module";
import { ManualComponent } from "./components/manual/manual.component";
import { PreprocessingComponent } from "./components/preprocessing/preprocessing.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { AnalysisMenuComponent } from "./components/analysis-menu/analysis-menu.component";
import { SharedModule } from "src/app/shared/shared.module";
import { FileUploadModule } from 'ng2-file-upload';
import { savedDocForAnalysis } from "./components/savedDocForAnalysis/savedDocForAnalysis.component";
import {TranslateModule} from '@ngx-translate/core';
import { FileListComponent } from '../middleware/components/file-list/file-list.component';

@NgModule({
  declarations: [
    ManualComponent,
    PreprocessingComponent,
    AnalysisComponent,
    AnalysisMenuComponent,
    savedDocForAnalysis
  ],
    imports: [CommonModule, AnalysisRoutingModule, FileUploadModule, TranslateModule],
})
export class AnalysisModule {}
