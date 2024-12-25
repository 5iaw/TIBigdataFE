import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AnalysisRoutingModule } from "./analysis-routing.module";
import { ManualComponent } from "./components/manual/manual.component";
import { PreprocessingComponent } from "./components/preprocessing/preprocessing.component";
import { AnalysisComponent } from "./components/analysis/analysis.component";
import { AnalysisMenuComponent } from "./components/analysis-menu/analysis-menu.component";
import { FileUploadModule } from "ng2-file-upload";
import { savedDocForAnalysis } from "./components/savedDocForAnalysis/savedDocForAnalysis.component";
import { TranslateModule } from "@ngx-translate/core";
import { FileListComponent } from "./components/file-list/file-list.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    ManualComponent,
    PreprocessingComponent,
    AnalysisComponent,
    AnalysisMenuComponent,
    savedDocForAnalysis,
    FileListComponent,
  ],
  imports: [
    CommonModule,
    AnalysisRoutingModule,
    FileUploadModule,
    TranslateModule,
    FormsModule,
  ],
})
export class AnalysisModule {}
