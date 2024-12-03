import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-analysis-menu",
  templateUrl: "./analysis-menu.component.html",
  styleUrls: ["../../analysis-style.less"],
})
export class AnalysisMenuComponent implements OnInit {
  private _title: string = "";
  private _currentMenu: string = "";
  constructor(private router: Router,
              private translate: TranslateService) { }

  ngOnInit(): void {
    let url = this.router.url.split("/");
    this.currentMenu = url[url.length - 1];
    this.setTitle(this.currentMenu);
  }

  selectedStyleObject(flag: boolean): Object {
    if(matchMedia("(max-width: 425px)").matches) {
      if (flag) {
        return {
          "font-weight": "bold",
          "border-bottom" : "0.2rem solid #0FBAFF",
        };
      } else {
        return {
          color: "#898C8D",
          "background-color": "white",
        };
      }
    }else{
      if (flag) {
        return {
          color: "#0FBAFF",
          "font-weight": "bold",
        };
      } else {
        return {
          color: "black",
          "background-color": "white",
        };
      }
    }
  }
  /**
   * @description Set title according to current address
   * @param currentAddress
   */
  setTitle(currentAddress: string) {
    if (currentAddress === "manual") this.title = this.translate.instant('메뉴얼');
    if (currentAddress === "preprocessing") this.title = this.translate.instant('전처리');
    if (currentAddress === "analysis") this.title = this.translate.instant('자료분석');
    if (currentAddress === "file-list") this.title = this.translate.instant('file-list');
  }

  toManual() {
    this.router.navigateByUrl("/analysis-menu/manual");
    this.ngOnInit();
  }

  toPreprocessing() {
    this.router.navigateByUrl("/analysis-menu/preprocessing");
    this.ngOnInit();
  }

  toAnalysis() {
    this.router.navigateByUrl("/analysis-menu/analysis");
    this.ngOnInit();
  }

  toFileList() {
    this.router.navigateByUrl("/analysis-menu/file-list");
    this.ngOnInit();
  }

  public get currentMenu(): string {
    return this._currentMenu;
  }
  public set currentMenu(value: string) {
    this._currentMenu = value;
  }
  public get title(): string {
    return this._title;
  }
  public set title(value: string) {
    this._title = value;
  }
}
