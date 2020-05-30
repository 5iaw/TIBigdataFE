import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Color, Label, BaseChartDirective } from 'ng2-charts';
import { MultiDataSet } from 'ng2-charts';
import { HttpClient } from '@angular/common/http';
import { IpService } from 'src/app/ip.service';
import { EPAuthService } from '../../../../core/componets/membership/auth.service';
import { ElasticsearchService } from "../../search/service/elasticsearch-service/elasticsearch.service";
import { DocumentService } from "../../search/service/document/document.service"
import { RecomandationService } from "../../search/service/recommandation-service/recommandation.service";
import { DatabaseService } from "../../../../core/componets/database/database.service";
import { IdControlService } from "../../search/service/id-control-service/id-control.service";


import { CloudData, CloudOptions } from "angular-tag-cloud-module";

import { thresholdSturges } from 'd3-array';
import { map } from "rxjs/operators";
import { ReturnStatement, viewClassName } from '@angular/compiler';
import { doc } from '../../library/category-graph/nodes';
import { inject } from '@angular/core/testing';
import { FormControl, FormGroup } from "@angular/forms";
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { keyframes } from '@angular/animations';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})

export class DashboardComponent implements OnInit {

  @ViewChild(BaseChartDirective, { static: false }) charts: QueryList<BaseChartDirective>;;

  constructor(
    private db: DatabaseService,
    private auth: EPAuthService,
    private http: HttpClient,
    private ipService: IpService,
    private es: ElasticsearchService,
    private docSvc: DocumentService,
    private rcmd: RecomandationService,
    private idSvc: IdControlService
  ) { }

  RELATED: string = "RelatedDoc";
  analysisList: string[] = ["키워드분석(TFIDF)"];//"Related Doc",

  // analysisList: string[] = ["TFIDF", "LDA", "RNN"];//"Related Doc",
  graphList: string[] = ["Dounut", "Word-Cloud", "Bar", "Line"];




  docTitleList = [];

  // private tfidfDir: string = "../../../../../../assets/entire_tfidf/data.json";


  private hstReqUrl = this.ipService.getUserServerIp() + "/hst/getTotalHistory";
  private hstFreq: any[];

  private graphXData = [];
  private graphYData = [];
  private graphData = [];

  private ES_URL = "localhost:9200/nkdb";
  private myDocsTitles: string[] = [];
  private idList: string[] = [];
  private chosenList: string[] = [];
  private search_history = [];
  private chosenCount: number = 0;
  private docIdList: string[] = [];
  private choiceComplete = false;
  private userDataChoice = [];
  private userDocChoice = [];
  private userAnalysisChoice: string;
  private userGraphChoice: string;
  private userNumChoice = 0;


  //////////word
  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the size of the upper element multiplied by the value
    width: 800,
    height: 250,
  };

  cData: CloudData[] = [];




  ngOnInit() {
    this.auth.getLogInObs().subscribe((logInStat) => {

      if (!logInStat)
        // console.log("wow");
        alert("로그인이 필요한 서비스 입니다. 로그인 해주세요.");
      else {
        this.chosenCount = 0;
        // this..clearAll();
        console.log("dash board - page");
        this.getMyKeepDoc();
      }
    })

  }



  async getKeywords(ids) {
    return await this.db.getTfidfValue(ids, 5, true);
  }

  getMyKeepDoc() {
    this.auth.getMyDocs(true).then(titlesNiD => {
      console.log("get my keep doc : ", titlesNiD)
      let temp = titlesNiD as [];
      temp.map(o => {
        this.docTitleList.push(o["title"]);
        this.docIdList.push(o["id"])
        return;
      })//[{title, id},...]
      // this.idList = this.idSvc.getIdList();

      console.log(this.docTitleList)
      console.log(this.docIdList)
    })
  }

  addList(i) {
    this.chosenList.push(this.idList[i])
    this.chosenCount++;
    console.log(this.chosenList)
  }

  removeList(i) {
    this.chosenList.pop()
    this.chosenCount--;
    console.log(this.chosenList)

  }


  boxChange(i) {
    // this.docTitleList[i]
    // console.log(i)
    // console.log(this.docIdList[i])
    let idx = this.chosenList.indexOf(this.docIdList[i]);
    // console.log("idx : ", idx)
    if (idx != -1) {
      console.log("pull" + this.docTitleList[i]);
      this.chosenList.splice(idx, 1);
      this.chosenCount--;

    }
    else {
      console.log("push" + this.docTitleList[i]);
      this.chosenList.push(this.docIdList[i])
      this.chosenCount++;

    }



    console.log(this.chosenList)
  }
  //solve issue that the order collapse from pop function

  // private filter = [];
  // private checkArr = [];
  // boxChange(i) {
  //   if (this.filter[i]) {
  //     this.addList(i);
  //     console.log(i + "넣음");
  //   } else {
  //     this.removeList(i);
  //     console.log(i + "빠짐");
  //   }
  // }

  private TfTable = [];


  async makeTf() {
    // var docNum = this.idList.length;
    let tfidf_table = await this.db.getTfidfValue(this.chosenList, this.userNumChoice, true);
    // this.getKeywords(this.chosenList).then(tfidf_table => {
    // this.http.get(this.tfidfDir).subscribe(docData1 => {
    let oneDoc = tfidf_table as []
    console.log(oneDoc)
    var temp;
    var sampleID;
    var sampleTitle;

    const tempArr = [] as any;
    let tWord, tVal;
    var tJson = new Object();

    // oneDoc.map(d => {
    //   d["tfidf"]
    // })

    for (var i = 0; i < oneDoc.length; i++) {
      var docData = oneDoc[i]["tfidf"] as [];
      for (var t = 0; t < docData.length; t++) {
        var tData = docData[t];
        if (tData) {
          tWord = tData[0];
          tVal = tData[1];
          tJson = { word: tWord, value: tVal };
          tempArr.push(tJson);
        }
      }
    }


    tempArr.sort(function (a, b) {
      return b["value"] - a["value"];
    });

    this.findTextData(tempArr);
    this.findCountData(tempArr);


  }



  ///// put datas into GraphData /////
  findTextData(textArr) {
    // console.log(textArr)
    var nums = textArr.length;
    //nums = this.userNumChoice;
    //this.graphXData = [];
    if (nums > this.userNumChoice) {
      nums = this.userNumChoice;
    }
    for (var i = 0; i < nums; i++) {
      this.graphXData[i] = textArr[i]["word"];
    }
    console.log("X : " + this.graphXData);
  }

  findCountData(countArr) {
    var nums = countArr.length;
    // nums = this.userNumChoice;
    //this.graphYData = [];
    if (nums > this.userNumChoice) {
      nums = this.userNumChoice;
    }
    for (var i = 0; i < nums; i++) {
      this.graphYData[i] = countArr[i]["value"];
    }
    console.log("Y : " + this.graphYData);
  }

  getUserChoice() {
    this.userDataChoice = this.search_history;
    //this.userAnalysisChoice = "";
    //this.userGraphChoice  = document.getElementById("g1");
  }


  onChange(value) {
    this.userNumChoice = value;
  }

  clearResult() {
    this.barChartData = [];
    this.barChartLabels = [];

    this.lineChartData = [];
    this.lineChartLabels = [];

    this.doughnutChartData = [];
    this.doughnutChartLabels = [];

    this.userAnalysisChoice = "";
    this.userGraphChoice = '';
    this.userNumChoice = 0;
    console.log("CLEAR");
  }


  showResult() {
    console.clear();
    this.getUserChoice();
    this.choiceComplete = true;

    console.log(this.userAnalysisChoice)
    console.log(this.userGraphChoice)


    if (this.userAnalysisChoice == "키워드분석(TFIDF)") {
      console.log("분석 : " + this.userAnalysisChoice + " 그래프 : " + this.userGraphChoice);
      this.makeTf();
    }
    else if (this.userAnalysisChoice == "LDA") {
      console.log("분석 : " + this.userAnalysisChoice + " 그래프 : " + this.userGraphChoice);

    }
    else if (this.userAnalysisChoice == "RELATED") {
      this.makeRelatedCloud();

    }
    else if (this.userAnalysisChoice == "RNN") {
      console.log("분석 : " + this.userAnalysisChoice + " 그래프 : " + this.userGraphChoice);
    }
  }


  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          max: 1,
          min: 0
        }
      }]
    }
  };

  barChartLabels: Label[] = this.graphXData;

  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];


  barChartColors: Color[] = [
    { backgroundColor: 'rgba(000,153,255,0.5)' },
  ]


  barChartData: ChartDataSets[] = [
    { data: this.graphYData, label: this.userAnalysisChoice + " Analysis" }
  ];
  /////////////



  ///////// line chart /// 

  lineChartData: ChartDataSets[] = [
    { data: this.graphYData, label: this.userAnalysisChoice + " Analysis" },
  ];
  lineChartLabels: Label[] = this.graphXData;
  lineChartOptions = {
    responsive: true,
  };
  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(000,153,255,0.5)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  //////dounet chart ///
  doughnutChartOptions: ChartOptions = {
    responsive: true
  };
  public doughnutChartPlugins = [];
  doughnutChartLabels: Label[] = this.graphXData;
  doughnutChartData: MultiDataSet = [
    this.graphYData
  ];
  doughnutChartType: ChartType = 'doughnut';
  public doughnutChartColors = [
    {
      backgroundColor: [
        'rgba(255,0,0,0.3)',
        'rgba(255,153,0,0.3)',
        'rgba(255,255,0,0.3)',
        'rgba(0,255,0,0.3)',
        'rgba(0,0,255,0.3)',

      ]
    }
  ];



  makeRelatedCloud() {

    console.log("분석 : " + this.userAnalysisChoice + " 그래프 : " + this.userGraphChoice);
    this.db.getRcmdTable(this.chosenList[0], 10, true).then(data => {
      console.log(data);

      let graphData = data[0]["rcmd"] as [];


      let idsArr = []
      let valArr = []
      graphData.map(d => {
        idsArr.push(d[0])
        valArr.push(d[1])
        return
      })
      // for (let k = 0; k < graphData.length; k++) {
      //   idsArr.push(graphData[k][1])
      // }
      this.docSvc.convertID2Title(idsArr).then(t => {
        console.log("ad arr :", idsArr);
        console.log("titles : ", t);
        let titles = t as [];

        let temp_cData = []
        for (var j = 0; j < titles.length; j++) {
          if (j < 5) {
            temp_cData.push(
              {
                text: titles[j],
                weight: valArr[j],
                color: "blue"
              }
            )
          }
          else {
            temp_cData.push(
              {
                text: titles[j],
                weight: valArr[j],
                color: "gray"
              }
            )
          }

        }
        const changedData$: Observable<CloudData[]> = of(temp_cData);
        changedData$.subscribe(res => (this.cData = res));
      })
    });
  }


  makeWordCloud(graphData?) {
    const changedData$: Observable<CloudData[]> = of([]);
    changedData$.subscribe(res => (this.cData = res));

    for (let i in graphData) {
      if (Number(i) >= 30) break;
      else if (Number(i) <= 4) {
        this.cData.push({
          text: "A",
          weight: 10,
          // text: graphData[i][0],
          // weight: graphData[i][1],
          color: "blue"
        });
        // console.log(graphData[i][
      } else
        this.cData.push({
          text: "B",
          weight: 8,
          // text: graphData[i][0],
          // weight: graphData[i][1],
          color: "gray"
        });
    }


  }









}
