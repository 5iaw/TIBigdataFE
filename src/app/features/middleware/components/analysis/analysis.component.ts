import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['../../middleware-style.less'],
})
export class AnalysisComponent {
  constructor(public router: Router) { }

  toPreprocessing() {
    this.router.navigateByUrl("/middleware/analysis");
}


}