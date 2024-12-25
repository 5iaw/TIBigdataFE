// abstractAnalysisPage.ts
import { Directive, Injectable, OnInit } from "@angular/core";
import * as d3 from 'd3';
import { AnalysisOnMiddlewareService } from "src/app/core/services/analysis-on-middleware-service/analysis.on.middleware.service";
import { UserSavedDocumentService } from "src/app/core/services/user-saved-document-service/user-saved-document.service";
import $ from "jquery";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root",
  })

@Directive({
    selector: '[appChanges]'
})


export abstract class abstractAnalysis{

    private _email: string;
    private _selectedKeyword: string;
    private _selectedSavedDate: string;
    private _isSelectedPreprocessed: boolean;
    private _isDataPreprocessed: boolean = false;
    private _isDataPreview: boolean = false;


    constructor(
        private _middlewareService: AnalysisOnMiddlewareService,
        private _userSavedDocumentService: UserSavedDocumentService,
        private router: Router
      ){};

    toPreprocessing() {
        this.router.navigateByUrl("/analysis-menu/preprocessing");
    }

    toAnalysis() {
        this.router.navigateByUrl("/analysis-menu/analysis");
    }

    toMyAnalysis(){
        this.router.navigateByUrl("/userpage/my-analysis");
    }

    onMessage(event){
        let data = JSON.parse(event);
        this.email = data.email;

        // console.log(event);
        let selectedKeyword = data.savedKeyword;
        let selectedSavedDate = data.savedDate;
        let isSelectedPreprocessed = data.isSelectedPreprocessed;
        // console.log('isPreprocessed?'+isSelectedPreprocessed);

        if(data.activity=='select')       this.setSelected(selectedKeyword, selectedSavedDate, isSelectedPreprocessed);
        // else if(!isSelectedPreprocessed) return ;
        else if(data.activity=='preview') this.previewData(selectedKeyword,selectedSavedDate);
        else if(data.activity=='download') this.downloadData(selectedKeyword,selectedSavedDate);
        else ;

        }
    /**
     * @description set the variables of the document user selected
     */

    setSelected(selectedKeyword:string, selectedSavedDate:string, isSelectedPreprocessed: boolean){
        this.selectedKeyword=selectedKeyword;
        this.selectedSavedDate=selectedSavedDate;
        this.isSelectedPreprocessed = isSelectedPreprocessed;
    }

    /**
     * @description get the data to preview from middleware and show in a result table
     */

     async previewData(selectedKeyword:string, selectedSavedDate:string){
        let data = JSON.stringify({
            'userEmail': this.email,
            'keyword': selectedKeyword,
            'savedDate': selectedSavedDate,
          });

        //this.LoadingWithMask();

        let result = await this.middlewareService.postDataToFEDB('/textmining/getPreprocessedData', data);
        let tokens = Object.values(result.tokenList);
        let tokenData = new Array;

        let tmp = new Array();
        let res = new Array();

        for(let i in tokens){
            tokenData[i] = this.cleanArray(tokens[i]);
            tmp[i] = new Array();
            res[i] = new Array();
            for(let j=0; j<tokenData[i].length; j++){
                tmp[i] = tmp[i].concat(tokenData[i][j]);
            }
            if(tmp[i].length != 0){
                if(tmp[i].length < 10){
                    for(let j=0; j<tmp[i].length; j++)
                        res[i] = res[i].concat(tmp[i][j]);
                }else{
                    for(let j=0; j<10; j++)
                        res[i] = res[i].concat(tmp[i][j]);
                }
            }
        }
        result.tokenList = res;
        this.drawPreTable(result, "preview");

        this.isDataPreprocessed = false;
        this.isDataPreview =true;
        this.closeLoadingWithMask();
    }

    cleanArray( tmp: any){
        let newArray= new Array();
        for(let i=0; i<tmp.length; i++){
            if(tmp[i].length != 0 )
                newArray.push(tmp[i]);
        }
        return newArray;
    }

    /**
     * @description get the data to preview from middleware and make csv file and give a user as a file download method
     */

    async downloadData(selectedKeyword:string, selectedSavedDate:string) : Promise<void> {
        let data = JSON.stringify({
            'userEmail': this.email,
            'keyword': selectedKeyword,
            'savedDate': selectedSavedDate,
          });

        //this.LoadingWithMask();

        let result = await this.middlewareService.postDataToFEDB('/textmining/getPreprocessedData', data);
        let titles = Object.values(result.titleList);
        let tokens = Object.values(result.tokenList);
        let tokenData = new Array;

        let tmp = new Array();
        let res = new Array();

        for(let i in tokens){
            tokenData[i] = this.cleanArray(tokens[i]);
            tmp[i] = new Array();
            res[i] = new Array();
            for(let j=0; j<tokenData[i].length; j++){
                tmp[i] = tmp[i].concat(tokenData[i][j]);
            }
            if(tmp[i].length != 0){
                if(tmp[i].length < 50){
                    for(let j=0; j<tmp[i].length; j++)
                        res[i] = res[i].concat(tmp[i][j]);
                }else{
                    for(let j=0; j<50; j++)
                        res[i] = res[i].concat(tmp[i][j]);
                }
            }
        }

        let str ='';
        for(let i in titles){
            let line = '';
            line += titles[i];
            if(res[i].length != 0){
                for(let j=0; j<res[i].length; j++)
                    line += ',' + res[i][j];
            }
            str += line + '\r\n';
        }
        console.log(str);

        const link = document.createElement("a");
        const fileName = selectedKeyword + '.csv';
        const blob = new Blob(["\uFEFF"+str], { type: 'text/csv; charset=utf-8'});
        const url = URL.createObjectURL(blob);
        $(link).attr({"download" : fileName, "href": url});
        link.click();
    }

    /**
     * @description draw a preprocessing result table using d3 library.
     */
    drawPreTable(dataArray:any, activity: string){
        let data:Array<string>;
        d3.selectAll(".result-pretable > *").remove();
        const figure = d3.select("figure#pretable")
            .attr('class','result-pretable');
        if(activity=="preview"){
            //data= dataArray['tokenList'][0];

            data = dataArray['tokenList'];
        }
        else if(activity=="runProcessing"){
            data = dataArray['tokenList'];
            // console.log("runProcess",data);
        }
        figure.append("div").text('키워드:'+dataArray['keyword']);
        figure.append("div").text('전처리 날짜:'+dataArray['processedDate']);
        figure.append("div").text('토큰 개수:'+dataArray['nTokens']);

        const table = figure.append("div").style('height','200px')
        .style('overflow','auto')
        .append("table").style('width','100%');

        const th = table.append("tr")
        .style('padding','15px 0px')
        .style('font-weight','500')
        .style('text-align','center');

        th.append('th').text('제목');
        th.append('th').text('전처리');

        const tbody = table.append("tbody")
        .style('text-align','center');

        console.log(dataArray['titleList']);
        for(let i=0;i<dataArray['titleList'].length;i++){
            const tr = tbody.append("tr");
            tr.append("td").text(dataArray['titleList'][i]);
            tr.append("td").text(data[i]);
        }
    }

    /**
     * @description show a loading img
     */
    LoadingWithMask() {
        //화면의 높이와 너비를 구합니다.
        let maskHeight = $(document).height();
        let maskWidth  = window.document.body.clientWidth;
        let gif='../../../../assets/icons/loading.gif';

        //화면에 출력할 마스크를 설정해줍니다.
        var mask       ="<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; left:0; top:0; display:flex; justify-content: center; align-items: center;'></div>";
        var loadingImg = '';

        loadingImg +=" <img id='loading' src='"+ gif +"' style='position: absolute; margin: 0px auto;display: block;  '/>";



        //화면에 레이어 추가
        $('body')
            .append(mask)

        //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채웁니다.
        $('#mask').css({
        // 'width':'100%',
        // 'height':'100vh',
                'width' : maskWidth,
                'height': maskHeight,
                'opacity' :'0.7'
        });

        //마스크 표시
        $('#mask').show();

        // var center       ="<div id='center' style='width: 100%; height: 100vh; display:flex; justify-content: center; align-items: center; '></div>";
        // $('body')
        //     .append(center)

        // $('#center').append(loadingImg);
        // $('#center').show();
        $('#mask')
        .append(loadingImg);
        //로딩중 이미지 표시
        // $('#loading').css({
        //   'opacity' :'1.0'
        // })


        $('#loading').append(loadingImg);
        $('#loading').show();

        $('#mask').append("<button id='cancelbtn' style='position: absolute; margin: 0px auto;display: block;'>창닫기</button>");
        // $('#cancelbtn').click()
        // $(document).on("click", "#cancelbtn", this.closeLoadingWithMask());
    }

    /**
     * @description close a loading img
     */
    closeLoadingWithMask() {
        $('#mask, #loading').hide();
        $('#mask, #loading').empty();
    }

    /**
     * @description clear the result table
     */
    clearResult(){
        d3.selectAll('.result-pretable').remove();
        d3.selectAll('figure > *').remove();
    }



    public get middlewareService(): AnalysisOnMiddlewareService {
        return this._middlewareService;
    }
    public set middlewareService(value: AnalysisOnMiddlewareService) {
        this._middlewareService = value;
    }
    public get userSavedDocumentService(): UserSavedDocumentService {
        return this._userSavedDocumentService;
    }
    public set userSavedDocumentService(value: UserSavedDocumentService) {
        this._userSavedDocumentService = value;
    }

    public get selectedKeyword(): string {
        return this._selectedKeyword;
    }
    public set selectedKeyword(value: string) {
        this._selectedKeyword = value;
    }

    public get selectedSavedDate(): string {
        return this._selectedSavedDate;
    }
    public set selectedSavedDate(value: string) {
        this._selectedSavedDate = value;
    }

    public get isSelectedPreprocessed(): boolean {
        return this._isSelectedPreprocessed;
    }
    public set isSelectedPreprocessed(value: boolean) {
        this._isSelectedPreprocessed = value;
    }


    public get isDataPreprocessed() {
        return this._isDataPreprocessed;
      }
      public set isDataPreprocessed(value) {
        this._isDataPreprocessed = value;
      }

    public get isDataPreview(): boolean {
        return this._isDataPreview;
    }
    public set isDataPreview(value: boolean) {
        this._isDataPreview = value;
    }

    public get email(): string {
        return this._email;
    }
    public set email(value: string) {
        this._email = value;
    }
}
