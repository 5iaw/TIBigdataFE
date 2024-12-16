import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import * as d3 from 'd3';
import { Tooltip } from "chart.js";

@Component({
  selector: 'app-keyword-analysis',
  templateUrl: './keyword-analysis.component.html',
  styleUrls: ['./keyword-analysis.component.less']
})
export class KeywordAnalysisComponent implements OnInit, OnDestroy {
  private searchHistory = [];
  private searchSubscriber: Subscription;
  private searchKeyword: string;
  private currentYearMonth: string;
  private beforeSizYearMonth: string;
  private startYearMonth: string;
  private endYearMonth: string;
  private per: string;

  //related to drawing chart
  // set the dimensions and margins of the graph
  private margin;
  private width;
  private height;
  // append the svg object to the body of the page
  private svg;
  // Initialize the X axis
  private x;
  private xAxis;
  // Initialize the Y axis
  private y;
  private yAxis;

  constructor(private elasticsearchService: ElasticsearchService) {
    this.searchSubscriber = this.elasticsearchService
                                .getSearchStatus()
                                .subscribe(() => {
                                  this.setSearchKeyword();
                                });
  }

  ngOnInit(): void {
    this.setSearchKeyword();
    this.setMinMaxDate();
    this.initFigure();
    this.month_clicked();
  }

  ngOnDestroy() {
    this.searchSubscriber.unsubscribe();
  }

  setSearchKeyword() {
    this.searchKeyword = this.elasticsearchService.getKeyword();
  }

  setMinMaxDate(){
    var current = new Date();
    var year = current.getFullYear();
    var c_month = current.getMonth() + 1;

    var beforeSix = new Date(current.setMonth(current.getMonth() -6));
    var beforeSixyear = beforeSix.getFullYear();
    var beforeSix_month = beforeSix.getMonth() +2;

    if(c_month < 10) {
      this.currentYearMonth = "" + year + "-0" +  c_month;
      this.beforeSizYearMonth = "" + beforeSixyear + "-0" +  beforeSix_month;
    }
    else {
      this.currentYearMonth = "" + year + "-" +  c_month;
      this.beforeSizYearMonth = "" + beforeSixyear + "-" +  beforeSix_month;
    }

    this.startYearMonth = this.beforeSizYearMonth;
    this.endYearMonth = this.currentYearMonth;

  }

  year_clicked() {
    var yb = document.getElementById("year_button");
    var mb = document.getElementById("month_button");
    yb.style.background="lightgrey";
    mb.style.background="transparent";

    this.per = "year";
  }

  month_clicked() {
    var yb = document.getElementById("year_button");
    var mb = document.getElementById("month_button");
    mb.style.background="lightgrey";
    yb.style.background="transparent";

    this.per = "month";
  }

  getYearData(data){
    var yearData = [];
    var tmpYear = "-1";
    var tmpIdx = 0;
    for(var i = 0; i < data.length; i ++){
      var year = data[i]["date"].split("\.")[0];
      if(tmpYear == "-1"){
        yearData.push({date: year, freq: data[i]["freq"]});
        tmpYear = year;
      }
      else if(tmpYear == year){
        yearData[tmpIdx]["freq"] = yearData[tmpIdx]["freq"] + data[i]["freq"];
      }
      else {
        yearData.push({date: year, freq: data[i]["freq"]});
        tmpIdx++;
        tmpYear = year;
      }
    }
    return yearData;
  }

  setDatePickerStartYearMonth(e) {
    this.startYearMonth = e.target.value;
  }

  setDatePickerEndYearMonth(e) {
    this.endYearMonth = e.target.value;
  }

  async updateChart(){
    // console.log('update chart startYearMonth : '+this.startYearMonth);
    // console.log('update chart endYearMonth : '+this.endYearMonth);

//     var dataPerYear = await this.updateData(this.startYearMonth, this.endYearMonth);
    var dataPerMonth = await this.updateData(this.startYearMonth, this.endYearMonth);
    // console.log(dataPerMonth);
//     var jan = {date: "2022.01", freq: 18};
//     var feb = {date: "2022.02", freq: 30};
//     var mar = {date: "2022.03", freq: 55};
//
//     var data1 = [jan];
//     var data2 = [feb];
//     var data3 = [mar];
//     var data12 = [jan, feb];
//     var data13 = [jan, feb, mar];
//     var data23 = [feb, mar];

    var x = this.x;
    var xAxis = this.xAxis;
    var y = this.y;
    var yAxis = this.yAxis;
    var svg = this.svg;
    var height = this.height;
    var width = this.width;

    console.log("height: " , height, "width:", width);

    function update(data) {
      // Update the X axis
      x.domain(data.map(d => d["date"]))
      xAxis.call(d3.axisBottom(x))
      // Update the Y axis
      y.domain([0, d3.max(data, function(d) { return d["freq"]; }) ] as number[]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y).ticks(5));
      // Create the u variable
      var u = svg.selectAll("rect")
                 .data(data);
      u.join("rect") // Add a new rect for each new elements
       .transition()
       .duration(1000)
       .attr("x", d => x(d["date"]))
       .attr("y", d => y(d["freq"]))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d["freq"]))
       .attr("fill", "#38bdff");
    }

    //For test
    if(this.per == "month"){
      update(dataPerMonth);
//       if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-01"){
//         update(dataPerMonth);
//       }
//       else if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-02"){
//         update(data12);
//       }
//       else if(this.startYearMonth == "2022-02" && this.endYearMonth == "2022-02"){
//         update(data2);
//       }
//       else if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-03"){
//         update(data13);
//       }
//       else if(this.startYearMonth == "2022-02" && this.endYearMonth == "2022-03"){
//         update(data23);
//       }
//       else if(this.startYearMonth == "2022-03" && this.endYearMonth == "2022-03"){
//         update(data3);
//       }
    } else{
        var year_data = await this.getYearData(dataPerMonth);
        update(year_data)
    }
  }

  initFigure() {
    //related to drawing chart
    // set the dimensions and margins of the graph
    this.margin = {top: 30, right: 30, bottom: 30, left: 60};
    this.width = 460 - this.margin.left - this.margin.right; //460
    this.height = 400 - this.margin.top - this.margin.bottom; // 400

    // append the svg object to the body of the page
    this.svg = d3.select("#keyword_analysis")
                 .append("svg")
                 .attr("width", this.width + this.margin.left + this.margin.right)
                 .attr("height", this.height + this.margin.top + this.margin.bottom)
                 .attr("viewBox", `0, 0, ${this.width + this.margin.left + this.margin.right}, ${this.height + this.margin.top + this.margin.bottom}`)
                 .append("g")
                 .attr("transform",
                       "translate(" + this.margin.left + "," + this.margin.top + ")");
    // Initialize the X axis
    this.x = d3.scaleBand()
               .range([ 0, this.width ])
               .padding(0.4);
    this.xAxis = this.svg.append("g")
                         .attr("transform", "translate(0," + this.height + ")");

    // Initialize the Y axis
    this.y = d3.scaleLinear()
               .range([ this.height, 0]);
    this.yAxis = this.svg.append("g")
                         .attr("class", "myYaxis");
    this.updateChart();
  }

  async updateData(start, end) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    if(startDate > endDate){
      console.log("DATE_ERROR");
      alert("날짜 범위 설정이 잘못되었습니다. 다시 확인해주세요.");
      this.setMinMaxDate();
      this.updateChart();
      return;
    }

    var monthDifference = -1;
    var month = []
    var year = []

    var interval = endDate.valueOf() - startDate.valueOf();
    var monthValue = 1000*60*60*24*30;
    var monthDifference = Math.floor(interval/monthValue) + 1;

    var startYear = +start.split("-")[0]
    var startMonth = +start.split("-")[1]

    for(i = monthDifference; i > 0; i--){
      if(startMonth == 13){
        startYear++;
        startMonth = 1;
      }
      year.push(startYear);
      month.push(startMonth++);
    }

    var searchHistory = [];

    for(var i = 0; i < month.length; i++){
      var y = year[i];
      var m = month[i];

      if(m < 10){
        m = "0" + m;
      }
      else {
        m = "" + m;
      }

      var index = "search_log-" + y + "." + m;
      var count;
      try {
        count = await this.elasticsearchService.getSearchHistory();
        const hist = {date: "" + y + "." + m, freq: count["count"]};
        searchHistory.push(hist);
      }
      catch (e) {
        console.log("There is no log file for year: " + y + ", month: " + m);
        const hist = {date: "" + y + "." + m, freq: 0};
        searchHistory.push(hist);
      }
    }

    return searchHistory;
  }

  public get getSearchKeyword(): string {
    return this.searchKeyword;
  }

  public get getCurrentYearMonth(): string {
      return this.currentYearMonth;
  }

  public get getBeforeSixMonthYearMonth(): string {
    return this.beforeSizYearMonth;
  }
}


