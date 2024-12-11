import { Component, Injectable, OnInit } from "@angular/core";
import { abstractAnalysis } from "../abstractAnalysisPage";
import * as d3 from 'd3';
import { Tooltip } from "chart.js";
import * as lda from "./ldavis.v3.0.0.js";
import { svgAsPngUri, saveSvgAsPng } from "save-svg-as-png";
import { Router } from "@angular/router";
import { interval } from "rxjs";
import { concatMap, takeWhile, switchMap, delay } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";

// @Injectable({
//   providedIn: "root",
// })

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.component.html",
  styleUrls: ['../../analysis-style.less'],
})

export class AnalysisComponent extends abstractAnalysis implements OnInit  {

  private _isDataAnalysised: boolean = false;
  public _analysisedData: any;

  private margin = 50;  private margina = {top: 10, right: 30, bottom: 30, left: 40};
  private width = 800 - (this.margin * 2);
  private height = 480 - (this.margin * 2);
  public optionValue1: string;
  public optionValue2: string;
  public optionValue3: string;

  private analysis: string;

  output_path: string;
  jobId: string | null = null;

  jobStatus: string = "Waiting for job to start...";
  isJobCompleted: boolean = false;
  loading: boolean = false;
  connectionStatus: string = "Checking connection...";
  results: string | null = null;

  // constructor(
  //   _middlewareService, 
  //   _userSavedDocumentService, 
  //   private router: Router) {
  //     super(_middlewareService,
  //       _userSavedDocumentService);
  //  }

  ngOnInit(): void { }

  /**
  * @description show pop up when the analysis name is on click
  */
  showPop(analName: string) {
    if (document.getElementById(analName).style.display == 'inline') {
      document.getElementById(analName).style.display = 'none'
      document.getElementById(analName + "-head").style.background = 'none';
      document.getElementById(analName + "-head").style.color = 'black';
    }
    else {
      document.getElementById(analName).style.display = 'inline';
      document.getElementById(analName + "-head").style.background = '#52B9FF';
      document.getElementById(analName + "-head").style.color = 'white';
    }
  }

  /**
   * @description run Analysis
   */

  // async runAnalysis(analysis:string): Promise<void>{


  //   // Check the options
  //   if(this.selectedSavedDate==null) return alert('문서를 선택해주세요!');
  //   if(!this.isSelectedPreprocessed) return alert('선택하신 문서는 전처리되지 않은 문서입니다. 전처리를 먼저 해주세요!');
  //   this.optionValue1 =  (<HTMLInputElement> document.getElementById(analysis+'_option1'))!= null? (<HTMLInputElement> document.getElementById(analysis+'_option1')).value:null;
  //   this.optionValue2 =  (<HTMLInputElement> document.getElementById(analysis+'_option2')) != null? (<HTMLInputElement> document.getElementById(analysis+'_option2')).value:null;
  //   this.optionValue3 =  (<HTMLInputElement> document.getElementById(analysis+'_option3')) != null? (<HTMLInputElement> document.getElementById(analysis+'_option3')).value:null;

  //   this.LoadingWithMask();
  //   document.getElementById("cancelbtn").addEventListener("click", this.closeLoadingWithMask);

  //   let data = JSON.stringify({
  //     'userEmail': this.email,
  //     'keyword': this.selectedKeyword,
  //     'savedDate': this.selectedSavedDate,
  //     'option1': this.optionValue1,
  //     'option2': this.optionValue2,
  //     'option3': this.optionValue3,
  //     'analysisName': analysis,
  //   });

  //   this.clearResult();
  //   // if(analysis!='topicLDA'){
  //   // Send Requests to Flask
  //   let res = await this.middlewareService.postDataToMiddleware('/textmining',data);

  //   if(res==null){
  //     this.isDataAnalysised = false;
  //     alert("내부적인 오류가 발생했습니다. 잠시후 다시 시도해주세요");
  //     this.closeLoadingWithMask();
  //     return ;
  //   }

  //   if(res.returnCode!=200){
  //     alert(res.errMsg);
  //     this.closeLoadingWithMask();
  //     return ;
  //   };

  //   this.analysisedData = res;
  //   this.isDataAnalysised = true;
  //   this.isDataPreview =false;
  //   // let temp=[];
  //   // // let i=0;
  //   // for (let i=0;i< Object.keys(this.analysisedData).length;i++){
  //   //   temp.push({word:Object.keys(this.analysisedData)[i], count:this.analysisedData[Object.keys(this.analysisedData)[i]]});
  //   // }


  //   if(analysis=='count'|| analysis=='tfidf'){
  //     this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
  //     this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(analysis=='network'){
  //     this.drawTable(analysis, JSON.stringify(res.result_table));
  //     this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(analysis=='ngrams'){
  //     this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(analysis=='kmeans'){
  //     this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
  //     this.drawScatterChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(analysis=='word2vec'){
  //     // this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
  //     this.drawScatterWordChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(analysis=='hcluster')
  //     this.drawTreeChart(JSON.stringify(this.analysisedData.result_graph));
  //   // }
  //   else if(analysis=='topicLDA')
  //     this.drawTopicModeling(JSON.stringify(this.analysisedData.result_graph));

  //   alert("분석 완료되었습니다.");
  //   this.closeLoadingWithMask();
  // }

  async runAnalysis(analysis: string): Promise<void> {

    // Check the options
    if (this.selectedSavedDate == null) return alert('문서를 선택해주세요!');
    if (!this.isSelectedPreprocessed) return alert('선택하신 문서는 전처리되지 않은 문서입니다. 전처리를 먼저 해주세요!');
    this.optionValue1 = (<HTMLInputElement>document.getElementById(analysis + '_option1')) != null ? (<HTMLInputElement>document.getElementById(analysis + '_option1')).value : null;
    this.optionValue2 = (<HTMLInputElement>document.getElementById(analysis + '_option2')) != null ? (<HTMLInputElement>document.getElementById(analysis + '_option2')).value : null;
    this.optionValue3 = (<HTMLInputElement>document.getElementById(analysis + '_option3')) != null ? (<HTMLInputElement>document.getElementById(analysis + '_option3')).value : null;

    this.LoadingWithMask();
    document.getElementById("cancelbtn").addEventListener("click", this.closeLoadingWithMask);

    this.analysis = analysis;
    let data = JSON.stringify({
      'userEmail': this.email,
      'keyword': this.selectedKeyword,
      'savedDate': this.selectedSavedDate,
      'option1': this.optionValue1,
      'option2': this.optionValue2,
      'option3': this.optionValue3,
      'analysisName': analysis,
    });

    this.clearResult();
    // if(analysis!='topicLDA'){
    // Send Requests to Flask
    // let res = await this.middlewareService.postDataToMiddleware('/textmining',data);

    let res = await this.middlewareService.postDataToFlask('/spark/submit_job', data);
    console.log(res);
    console.log("testing res.errMsg" + res.errMsg);
    console.log("testing res.returnCode");

    if (res == null) {
      this.isDataAnalysised = false;
      alert("내부적인 오류가 발생했습니다. 잠시후 다시 시도해주세요");
      this.closeLoadingWithMask();
      return;
    }

    if (res.state != 'starting') {
      console.log(res);
      alert(res);
      this.closeLoadingWithMask();

      return;
    };

    console.log("Job submitted successfully:", res);
    this.output_path = res.output_path;
    this.jobId = res.id; // Assuming the response contains the job ID
    this.jobStatus = "Job submitted, waiting for completion...";

    this.pollJobStatus();

    // this.analysisedData = res;
    // this.isDataAnalysised = true;
    // this.isDataPreview =false;
    // // let temp=[];
    // // // let i=0;
    // // for (let i=0;i< Object.keys(this.analysisedData).length;i++){
    // //   temp.push({word:Object.keys(this.analysisedData)[i], count:this.analysisedData[Object.keys(this.analysisedData)[i]]});
    // // }


    // if(analysis=='count'|| analysis=='tfidf'){
    //   this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
    //   this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    // else if(analysis=='network'){
    //   this.drawTable(analysis, JSON.stringify(res.result_table));
    //   this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    // else if(analysis=='ngrams'){
    //   this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    // else if(analysis=='kmeans'){
    //   this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
    //   this.drawScatterChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    // else if(analysis=='word2vec'){
    //   // this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
    //   this.drawScatterWordChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    // else if(analysis=='hcluster')
    //   this.drawTreeChart(JSON.stringify(this.analysisedData.result_graph));
    // // }
    // else if(analysis=='topicLDA')
    //   this.drawTopicModeling(JSON.stringify(this.analysisedData.result_graph));

    // alert("분석 완료되었습니다.");
    // this.closeLoadingWithMask();
  }

  // pollJobStatus(): void {
  //   const jobStatusSubscription = interval(3000)
  //     .pipe(
  //       takeWhile(() => !this.isJobCompleted), // Stop polling once the job is completed
  //       switchMap(() => this.getJobStatus(Number(this.jobId))), // Fetch job status from Flask
  //     )
  //     .subscribe(
  //       (status) => {
  //         if (status.state === "success") {
  //           this.jobStatus = "Job completed successfully!";
  //           this.isJobCompleted = true;
  //           this.loading = false; // Stop loading
  //           console.log(this.getAnalysisResult());
  //           jobStatusSubscription.unsubscribe();
  //         } else if (status.state === "failed") {
  //           this.jobStatus = "Job failed.";
  //           this.isJobCompleted = true;
  //           this.loading = false; // Stop loading
  //           jobStatusSubscription.unsubscribe();
  //         } else {
  //           this.jobStatus = "Job is still running...";
  //         }
  //         console.log("Job status:  ", this.jobStatus);
  //       },
  //       (error) => {
  //         console.error("Error fetching job status:", error);
  //       },
  //     );
  // }
  async pollJobStatus(): Promise<void> {
    console.log("Starting job status polling...");
    try {
      const pollingInterval = setInterval(async () => {
        const status = await this.getJobStatus(Number(this.jobId));
        console.log("Job status: ", status.state);

        if (status.state === "success") {
          clearInterval(pollingInterval);
          this.jobStatus = "Job completed successfully!";
          this.isJobCompleted = true;
          this.loading = false;
          // alert("분석 완료되었습니다.");
          // this.closeLoadingWithMask();
          await this.getAnalysisResult(); // Fetch results after completion
        } else if (status.state === "failed") {
          clearInterval(pollingInterval);
          this.jobStatus = "Job failed.";
          this.isJobCompleted = true;
          this.loading = false;
          alert("분석 실패하었습니다.");
        } else {
          this.jobStatus = "Job is still running...";
        }
      }, 3000);
    } catch (error) {
      console.error("Error polling job status:", error);
    }
  }


  // Remember to check jobId
  // getJobStatus(jobId: number) {
  //   const url = `${this.middlewareUrl}/status/${jobId}`; // Flask backend URL (update the port if needed)
  //   console.log("Getting results from ", url);
  //   return this.http.get<{ state: string }>(url);
  // }
  async getJobStatus(jobId: number): Promise<{ state: string }> {
    const url = `/spark/status/${jobId}`;  // Route relative to middleware URL
    console.log("Getting job status from", `/spark${url}`);

    try {
      const status = await this.middlewareService.getDataFromFlask(url);
      if (!status || !status.state) {
        throw new Error("Invalid response: Missing 'state' field");
      }
      console.log(status);
      return status;
    } catch (error) {
      console.error("Error fetching job status:", error);
      throw error;
    }
  }



  // getAnalysisResult() {
  //   const url = `${this.middlewareUrl}/read_file?output_path=${encodeURIComponent(this.output_path)}`;
  //   console.log("Getting results from ", url);

  //   this.http.get<{ file_content: string }>(url).subscribe(
  //     (response) => {
  //       this.analysisedData = response;  // Adjust if file_content is directly returned
  //       console.log("Analysis result:", this.analysisedData);

  //       this.displayValue = "";
  //       this.output_path = "";
  //       this.jobId = null;
  //       this.isJobCompleted = false;
  //       this.jobStatus = "";

  //       // Check if result_graph is defined before logging or using it
  //       // if (this.analysisedData.result_graph) {
  //       //     console.log("Result graph:", JSON.stringify(this.analysisedData.result_graph));

  //       // call visualization
  //       this.drawResultVisualizations();
  //       // } else {
  //       //     console.error("result_graph is undefined");
  //       // }
  //     },
  //     (error) => {
  //       console.error("Error fetching analysis result:", error);
  //     },
  //   );
  // }
  async getAnalysisResult(): Promise<void> {
    const url = `/spark/read_file?output_path=${this.output_path}`;  // Route relative to middleware URL
    console.log("Getting analysis result from", `/spark${url}`);

    try {
      const response = await this.middlewareService.getDataFromFlask(url);
      this.analysisedData = response;
      console.log("Analysis result:", this.analysisedData);

      this.output_path = "";
      this.jobId = null;
      this.isJobCompleted = false;
      this.jobStatus = "";

      this.drawResultVisualizations();
    } catch (error) {
      console.error("Error fetching analysis result:", error);
    }
  }



  drawResultVisualizations(): void {
    if (this.analysisedData && this.analysisedData.result_graph) {
      console.log("Drawing visualizations...");
      // Add visualization logic here
      if (this.analysis === 'count' || this.analysis === 'tfidf') {
        this.drawTable(this.analysis, JSON.stringify(this.analysisedData.result_graph));
        console.log('Done drawing table!')
        this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
        console.log('Done drawing chart!')
      }
      else if (this.analysis == 'network') {
        // this.drawTable(this.analysis, JSON.stringify(this.analysisedData.result_table));
        this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
      }
      else if (this.analysis == 'ngrams') {
        this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
      }
      else if (this.analysis == 'kmeans') {
        this.drawTable(this.analysis, JSON.stringify(this.analysisedData.result_graph));
        console.log('Done drawing table!')
        this.drawScatterChart(JSON.stringify(this.analysisedData.result_graph));
        console.log('Done drawing scatter chart!')
      }
      else if (this.analysis == 'word2vec') {
        // this.drawTable(analysis, JSON.stringify(this.analysisedData.result_graph));
        this.drawScatterWordChart(JSON.stringify(this.analysisedData.result_graph));
      }
      else if (this.analysis == 'hcluster')
        this.drawTreeChart(JSON.stringify(this.analysisedData.result_graph));
      // }
      else if (this.analysis == 'topicLDA')
        this.drawTopicModeling(JSON.stringify(this.analysisedData.result_graph));

      else if (this.analysis == 'ner')
        this.drawTable(this.analysis, JSON.stringify(this.analysisedData.result_graph));

      alert("분석 완료되었습니다.");
      this.closeLoadingWithMask();
    }
  }
  /**
   * @description draw a result table for analysis using d3
   */

  drawTable(analType: string, data_str: string) {
    let data: any = JSON.parse(data_str);

    const table = d3.select("figure#table")
      .attr('class', 'result-pretable')
      .append("table")
      .attr('width', '100%')
      .attr('height', '300px')

    if (analType == 'count' || analType == 'tfidf') {
      const th = table.append("tr")
        .style('padding', '15px 0px')
        .style('font-weight', '500')
        .style('text-align', 'center');

      th.append('th').text('No');
      th.append('th').text('단어');
      th.append('th').text('값');

      const tbody = table.append("tbody")
        .style('text-align', 'center');

      for (let i = 0; i < data.length; i++) {
        const tr = tbody.append("tr");
        tr.append("td").text(i + 1);
        tr.append("td").text(data[i]['word']);
        tr.append("td").text(data[i]['value']);
      }
    }

    else if (analType == 'kmeans') {
      console.log('KMeans table : ');
      const th = table.append("tr")
        .style('padding', '15px 0px')
        .style('font-weight', '500')
        .style('text-align', 'center');

      th.append('th').text('category');
      th.append('th').text('title');
      // th.append('th').text('값');
      console.log('Table headers created', th);

      const tbody = table.append("tbody")
        .style('text-align', 'center');

      let max = 0;
      for (let i = 0; i < data.length; i++) {
        console.log(`Checking data[${i}]:`, data[i]);
        if (data[i]['category'] > max)
          max = data[i]['category'];
        console.log(`New max category found: ${max}`);
      }

      console.log(`Maximum category: ${max}`);
      for (let i = 0; i <= max; i++) {
        console.log(`Creating row for category: ${i + 1}`);
        const tr = tbody.append("tr");
        tr.append("td").text(i + 1);
        const td = tr.append("td");
        
        let categoryCount = 0;
        for (let j = 0; j < data.length; j++) {
          console.log(`Checking if data[${j}]['category'] == ${i}`);
          if (data[j]['category'] == i) {
            console.log(`Adding title to category ${i}:`, data[j]['title']);
            td.append("ul").text(data[j]['title']);
            categoryCount++;
          }
        }
        if (categoryCount === 0) {
          console.log(`No entries found for category ${i}`);
        }
        // tr.append("td").text(data[i]['value']);
      }
      console.log('KMeans analysis completed');
    }
      else if(analType=='ner'){
        const th = table.append("thead").append("tr")
            .style('padding', '15px 0px')
            .style('font-weight', '500')
            .style('text-align', 'center');

        th.append('th').text('No');
        th.append('th').text('단어');
        th.append('th').text('품사');

        // Create table body
        const tbody = table.append("tbody")
            .style('text-align', 'center');

        console.log("Start appending rows...");  // Debug line to indicate the start of row appending

        // Loop through data and create rows for each entry
        data.forEach((item, index) => {
            console.log("Row Data - Word:", item['word'], "POS:", item['value']);  // Debug line to check each row's data

            const tr = tbody.append("tr");

            // Add table cells for "No", "단어", and "품사"
            tr.append("td").text(index + 1);  // No
            tr.append("td").text(item['word']);  // 단어 (Word)
            tr.append("td").text(item['value']);  // 품사 (POS Tag)

            console.log("Row appended for index:", index + 1);  // Debug line to confirm row is added
        });

        console.log("Finished appending rows.");
    

    }

    else if (analType == 'network') {
      const th = table.append("tr")
        .style('padding', '15px 0px')
        .style('font-weight', '500')
        .style('text-align', 'center');

      th.append('th').attr('width', '10%').text('index');
      th.append('th').attr('width', '18%').text('사이중심성');
      th.append('th').attr('width', '18%').text('근접중심성');
      th.append('th').attr('width', '18%').text('빈도수');
      th.append('th').attr('width', '18%').text('연결중심성');
      th.append('th').attr('width', '18%').text('eigenvector');

      // th.append('th').text('값');

      console.log(data);
      const tbody = table.append("tbody")
        .style('text-align', 'center');

      for (let i = 0; i < data['between_cen'].length; i++) {
        const tr = tbody.append("tr");
        tr.append("td").text(i + 1);
        // tr.append("td").text(data['between_cen'][i]['word']+'/'+ Math.floor(data['between_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['closeness_cen'][i]['word']+'/'+ Math.floor(data['closeness_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['count'][i]['word']+'/'+ Math.floor(data['count'][i]['value']*1000)/1000);
        // tr.append("td").text(data['degree_cen'][i]['word']+'/'+ Math.floor(data['degree_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['eigenvector_cen'][i]['word']+'/'+ Math.floor(data['eigenvector_cen'][i]['value']*1000)/1000);

        tr.append("td").text(data['between_cen'][i]['word'] + '/' + data['between_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['closeness_cen'][i]['word'] + '/' + data['closeness_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['count'][i]['word'] + '/' + data['count'][i]['value'].toExponential(3));
        tr.append("td").text(data['degree_cen'][i]['word'] + '/' + data['degree_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['eigenvector_cen'][i]['word'] + '/' + data['eigenvector_cen'][i]['value'].toExponential(3));
        // tr.append("td").text(data[i]['value']);
      }
    }
  }

  /**
   * @description draw a bar chart using the data using d3
   */

  drawBarChart(data_str: string) {
    let data: Array<{ word: string, value: number }> = JSON.parse(data_str);

    // console.log(data);
    // let data=[
    //   {word:"북한",count:10},
    //   {word:"통일",count:9},
    //   {word:"문재인",count:9},
    //   {word:"박근혜",count:8}
    // ];

    let margin = ({ top: 20, right: 0, bottom: 30, left: 40 });
    let width = 1000;
    let height = 500;

    function zoom(svg) {
      const extent: [[number, number], [number, number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

      function zoomed(event) {
        x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
        svg.selectAll(".bars rect").attr("x", d => x(d.word)).attr("width", x.bandwidth());
        svg.selectAll(".x-axis").call(xAxis);
      }
    }

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.word))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top])

    const svg = d3.select("figure#bar")
      .append("svg")
      .attr("id", "svgstart")
      .attr("viewBox", "0, 0," + width + "," + height)
      .call(zoom);

    // Draw bars
    svg.append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.word))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth())
      .on("mouseover", function (e, d) {
        tooltip
          .html("Word: " + d.word + "<br>" + "Value: " + d.value)
          .style("opacity", 1)
        d3.select(this).attr("fill", "red")
      })
      .on("mousemove", function (e, d) {
        tooltip
          .style("left", (e.pageX + 20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", (e.pageY) + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
        tooltip.style("opacity", 0);
      });

    // Draw the X-axis on the DOM
    svg.append("g")
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Draw the Y-axis on the DOM
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Draw a tooltip
    const tooltip = d3.select("figure#bar")
      .append("div")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  }

  /**
   * @description draw a scatter chart using the data using d3
   */

  drawScatterChart(data_str: string) {
    let data: Array<{
      "category": number,
      "title": string,
      "x": number,
      "y": number
    }> = JSON.parse(data_str);

    let margin = ({ top: 10, right: 30, bottom: 30, left: 60 });
    let width = 750 - margin.left - margin.right;
    let height = 750 - margin.top - margin.bottom;


    function zoom(svg) {
      const extent: [[number, number], [number, number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

      function zoomed(event) {
        x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
        svg.selectAll(".dots circle").attr("x", d => x(d.x))//.attr("width", x.bandwidth());
        svg.selectAll(".x-axis").call(xAxis);
      }
    }


    // Add X axis
    const x = d3.scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, width]);

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
      .range([height, 0]);

    // append the svg object to the body of the page
    const svg = d3.select("figure#scatter")
      .append("svg")
      .attr("id", "svgstart")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", "0, 0," + (width + margin.left + margin.right) + "," + (height + margin.top + margin.bottom))
      .call(zoom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


    const xAxis = g => g
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))

    const yAxis = g => g
      // .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
    // .call(g => g.select(".domain").remove())

    // Draw x-axis
    svg.append("g")
      .call(xAxis)
    // .attr("transform", "translate(0," + height + ")")
    // .call(d3.axisBottom(x));

    // Draw y-axis
    svg.append("g")
      .call(yAxis)
    // .call(d3.axisLeft(y));


    // Color scale: give me a specie name, I return a color
    const color = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.category)])
      .interpolator(d3.interpolateSinebow)


    // console.log(color('0'));
    // Highlight the specie that is hovered
    const highlight = function (e, d) {
      let category = d.category;
      let colorset = <string>color(category);
      console.log(colorset);

      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", 3)

      d3.selectAll(".type" + category)
        .transition()
        .duration(200)
        .style("fill", colorset)
        .attr("r", 7)

      tooltip
        .html("Title: " + d.title + "<br>category: " + d.category)
        .style("opacity", 1)

      d3.selectAll(".dottext")
        .style("opacity", 0)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function (e, d) {
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", 5)

      tooltip
        .style("opacity", 0)
        .style("left", "0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", "0px");

      d3.selectAll(".dottext")
        .style("opacity", 1)
    }


    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", function (d) { return "dot type" + d.category })
      .attr("cx", function (d) { return x(d.x); })
      .attr("cy", function (d) { return y(d.y); })
      .attr("r", 5)
      .style("fill", function (d) { return color[d['category']] })
      .on("mouseover", highlight)
      .on("mouseout", doNotHighlight)
      .on("mousemove", function (e) {
        tooltip
          .style("left", (e.pageX + 20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", (e.pageY) + "px");
      });

    // After discussion
    // svg.append('g')
    // .selectAll("dottext")
    // .data(data)
    // .enter()
    // .append("text")
    //   .attr("class","dottext")
    //   .text(d=>d.title)
    //   .attr("x",d=>x(d.x))
    //   .attr("y",d=>y(d.y))
    //   .style("font-size", "10px")


    // Draw a tooltip
    const tooltip = d3.select("figure#scatter")
      .append("div")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  }


  /**
   * @description draw a scatter chart for word-2-vec using the data using d3
   */

  drawScatterWordChart(data_str: string) {
    let data: Array<{
      "word": string,
      "x": number,
      "y": number,
      "wcount": number
    }> = JSON.parse(data_str);

    const normWcount = d3.scaleLinear()
      .domain(d3.extent(data, d => +d['wcount']))
      .range([1, 2])

    let margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 750 - margin.left - margin.right,
      height = 750 - margin.top - margin.bottom;


    function zoom(svg) {
      const extent: [[number, number], [number, number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

      function zoomed(event) {
        x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
        svg.selectAll(".dots circle").attr("x", d => x(d.x))//.attr("width", x.bandwidth());
        svg.selectAll(".x-axis").call(xAxis);
      }
    }


    // Add X axis
    const x = d3.scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, width]);

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
      .range([height, 0]);

    // append the svg object to the body of the page
    const svg = d3.select("figure#scatter")
      .append("svg")
      .attr("id", "svgstart")
      .attr("viewBox", "0, 0," + (width + margin.left + margin.right) + "," + (height + margin.top + margin.bottom))
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .call(zoom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


    const xAxis = g => g
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))

    const yAxis = g => g
      // .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
    // .call(g => g.select(".domain").remove())

    // Draw x-axis
    svg.append("g")
      .call(xAxis)
    // .attr("transform", "translate(0," + height + ")")
    // .call(d3.axisBottom(x));

    // Draw y-axis
    svg.append("g")
      .call(yAxis)
    // .call(d3.axisLeft(y));


    // console.log(color('0'));
    // Highlight the specie that is hovered
    const highlight = function (e, d) {
      console.log(e)

      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", d => 15 * (normWcount(d['wcount'])))

      d3.selectAll(".type" + d.word)
        .transition()
        .duration(200)
        .style("fill", "red")
        .attr("r", d => 35 * (normWcount(d['wcount'])))

      tooltip
        .html("Word: " + d.word + "<br>x: " + d.x + "<br>y: " + d.y)
        .style("opacity", 1)

      d3.selectAll(".dottext")
        .style("opacity", 0)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function (e, d) {
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", d => 5 * (normWcount(d['wcount'])))

      tooltip
        .style("opacity", 0)
        .style("left", "0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", "0px");

      d3.selectAll(".dottext")
        .style("opacity", 1)
    }


    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", function (d) { return "dot type" + d.word })
      .attr("cx", function (d) { return x(d.x); })
      .attr("cy", function (d) { return y(d.y); })
      .attr("r", d => 5 * (normWcount(d['wcount'])))
      .style("fill", "black")
      .on("mouseover", highlight)
      .on("mouseout", doNotHighlight)
      .on("mousemove", function (e) {
        tooltip
          .style("left", (e.pageX + 20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", (e.pageY) + "px");
      });

    // After discussion
    svg.append('g')
      .selectAll("dottext")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "dottext")
      .text(d => d.word)
      .attr("x", d => (x(d.x) + 5))
      .attr("y", d => (y(d.y) - 3))
      .style("font-size", "10px")


    // Draw a tooltip
    const tooltip = d3.select("figure#scatter")
      .append("div")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  }


  // /**
  //  * @description draw a network chart using the data using d3
  //  */

  // drawOldNetworkChart(data_str:string){
  //   let data:any
  // //   {
  // //     "links" : Array<
  // //       {"source":number,
  // //       "target":number,
  // //       "weight":number}>,
  // //     "nodes" :  Array<{
  // //       "between_cen":number,
  // //       "closeness_cen":number,
  // //       "degree_cen":number,
  // //       "eigenvector_cen":number,
  // //       "id":number,
  // //       "name":string}>
  // // }
  // = JSON.parse(data_str);

  //   // console.log(data);
  //   const margin = {top: 10, right: 30, bottom: 30, left: 40},
  //   width = 1000 - margin.left - margin.right,
  //   height = 1000 - margin.top - margin.bottom;

  //   // append the svg object to the body of the page
  //   const svg = d3.select("figure#network")
  //   .append("svg")
  //   .attr("id","svgstart")
  //     // .attr("width", width + margin.left + margin.right)
  //     // .attr("height", height + margin.top + margin.bottom)
  //     .attr("viewBox", "0, 0," + (width + margin.left + margin.right)+","+  (height + margin.top + margin.bottom))
  //     .append("g")
  //     .attr("transform",
  //           "translate(" + margin.left + "," + margin.top + ")");


  //   // Highlight the specie that is hovered
  //   const highlight = function(e,d){

  //     d3.selectAll(".dot")
  //       .transition()
  //       .duration(200)
  //       .style("fill", "lightgrey")
  //       .attr("r", 3)

  //     d3.selectAll(".type" + d.id)
  //       .transition()
  //       .duration(200)
  //       .style("fill", "red")
  //       .attr("r", 7)

  //     tooltip
  //       .html(d.name)
  //       .style("opacity", 1)
  //   }

  //   // Highlight the specie that is hovered
  //   const doNotHighlight = function(e,d){
  //     d3.selectAll(".dot")
  //       .transition()
  //       .duration(200)
  //       .style("fill", "lightgrey")
  //       .attr("r", 5)

  //     tooltip
  //     .style("opacity", 0)
  //     .style("left",  "0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
  //     .style("top", "0px");

  //     d3.selectAll(".dottext")
  //       .style("opacity", 1)
  //   }

  //   // Initialize the links
  //   let link = svg
  //   .selectAll("line")
  //   .data(data.links)
  //   .enter()
  //   .append("line")
  //     .style("stroke", "#aaa")
  //     .style("stroke-width", 5);
  //     // .style("stroke-width", d=>d['weight']/10);

  //   // Initialize the nodes
  //   let node = svg
  //     .selectAll("circle")
  //     .data(data.nodes)
  //     .enter()
  //     .append("circle")
  //       .attr("class", function (d) { return "dot type" + d['id']} )
  //       .attr("r", 7)
  //       .style("fill", "#69b3a2")
  //     .on("mouseover", highlight)
  //     .on("mouseout", doNotHighlight )
  //     .on("mousemove", function(e) {
  //       tooltip
  //       .style("left", (e.pageX+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
  //       .style("top", (e.pageY) + "px");
  //     });


  //     const dataon = function(e,d){
  //       console.log("mouse on",d);
  //       svg
  //       .selectAll("circle")
  //       .attr("r", d.between_cen);
  //     }

  //     const dataoff = function(e,d){
  //       svg
  //       .selectAll("circle")
  //       .attr("r", 7);
  //     }

  //     // let buttons = d3.select("figure#network")
  //     // .append("button")
  //     // .data(data.nodes)
  //     // .text('사이중심성') //['사이중심성','근접중심성','빈도수','연결중심성','eigen value']
  //     // .on("mouseover",dataon)
  //     // .on("mouseout",dataoff);



  //   // d3.select("svg")
  //   svg.append("g")
  //     .selectAll('label')
  //     .append("text")
  //     .data(data.nodes)
  //       .attr("dx", function(d){return -7})
  //       .text(d=> d['name'])

  //   // Let's list the force we wanna apply on the network
  //   let simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
  //   .force("link", d3.forceLink()                               // This force provides links between nodes
  //         .id(function(d) { return d['id']; })                     // This provide  the id of a node
  //         .links(data.links)                                    // and this the list of links
  //   )
  //   .force("charge", d3.forceManyBody().strength(-40))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
  //   .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
  //   .on("end", ticked);

  //   // This function is run at each iteration of the force algorithm, updating the nodes position.
  //   function ticked() {
  //   link
  //     .attr("x1", function(d) { return d['source']['x']; })
  //     .attr("y1", function(d) { return d['source']['y']; })
  //     .attr("x2", function(d) { return d['target']['x']; })
  //     .attr("y2", function(d) { return d['target']['y']; });

  //   node
  //     .attr("cx", function (d) { return d['x']; })
  //     .attr("cy", function(d) { return d['y']; });
  //   }

  //   // Draw a tooltip
  //   const tooltip = d3.select("figure#network")
  //     .append("div")
  //     .style("opacity", 0)
  //     .style("position","absolute")
  //     .style("background-color", "white")
  //     .style("border", "solid")
  //     .style("border-width", "1px")
  //     .style("border-radius", "5px")
  //     .style("padding", "10px");
  // };

  /**
   * @description draw a network chart using the data using d3
   */

  drawNetworkChart(data_str: string) {
    let data: any
      //   {
      //     "links" : Array<
      //       {"source":number,
      //       "target":number,
      //       "weight":number}>,
      //     "nodes" :  Array<{
      //       "between_cen":number,
      //       "closeness_cen":number,
      //       "degree_cen":number,
      //       "eigenvector_cen":number,
      //       "id":number,
      //       "name":string,
      //       "count":number}>
      // }
      = JSON.parse(data_str);

    // normalize count
    const normCount = d3.scaleLinear()
      .domain(d3.extent(data['nodes'], d => +d['count']))
      .range([0, 1])

    const normWeight = d3.scaleLinear()
      .domain(d3.extent(data['links'], d => +d['weight']))
      .range([0, 1])

    // test
    // console.log(d3.extent(data['nodes'], d=>+d['count']));
    // console.log(data['nodes'])

    // for(let d of data['nodes']){
    //   console.log(d['count'],normCount(d['count']))
    // }

    //Set margins and sizes
    var margin = {
      top: 20,
      bottom: 50,
      right: 30,
      left: 50
    };

    //Extract data from dataset
    var nodes = data.nodes,
      links = data.links;
    var width = 1000 - margin.left - margin.right;
    var height = 1000 - margin.top - margin.bottom;
    //Load Color Scale
    var color = d3.scaleSequential()
      .domain([0, nodes.length])
      .interpolator(d3.interpolateSinebow)

    //Create an SVG element and append it to the DOM
    var svg = d3.select("figure#network")
      .append("svg")
      .attr("id", "svgstart")
      .attr("viewBox", "0, 0," + (width + margin.left + margin.right) + "," + (height + margin.top + margin.bottom))
      .call(d3.zoom()
        //   .extent([[0, 0], [width, height]])
        //   .scaleExtent([1, 10])
        .on("zoom", function (e, d) {
          g.attr("transform", e.transform)
        }))

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    //Load External Data
    // d3.json("got_social_graph.json", function(dataset){

    //Create Force Layout
    var force = d3.forceSimulation(nodes)
      .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function (d) { return d['id']; })                     // This provide  the id of a node
        .links(data.links)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-200))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))

    // Highlight the specie that is hovered
    const highlight = function (e, d) {
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "#FEE2C5")
        .attr("r", 3)

      d3.selectAll(".type" + d.id)
        .transition()
        .duration(200)
        .style("fill", "#F66B0E")
        .attr("r", 7)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function (e, d) {
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "#7FB5FF")
        .attr("r", function (d) { return normCount(d['count']) * 7 < 1 ? 1 : normCount(d['count'] * 7) })

      d3.selectAll(".dottext")
        .style("opacity", 1)
    }



    //Add links to SVG
    var link = g.selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .style("stroke-width", function (d) { return normWeight(d['weight']) * 5 < 1 ? 1 : normWeight(d['weight']) * 5 })
      .attr("class", "link")
      .style("stroke", "#C4DDFF")


    //Add nodes to SVG
    var node = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")

    //Add labels to each node
    var label = node.append("text")
      .attr("dx", 12)
      .attr("dy", "0.35em")
      .attr("font-size", function (d) { return normCount(d['count']) * 12 < 1 ? 9 : normCount(d['count']) * 12 })
      .text(function (d) { return d['name']; });

    //Add circles to each node
    var circle = node.append("circle")
      .attr("r", function (d) { return normCount(d['count']) * 7 < 1 ? 1 : normCount(d['count']) * 7 })
      .attr("fill", "#7FB5FF")
      // .attr("fill", function(d){ return color(d['id']); })
      .attr("class", function (d) { return "dot type" + d['id'] })
      .on("mouseover", highlight)
      .on("mouseout", doNotHighlight)


    //This function will be executed for every tick of force layout 
    force.on("tick", function () {
      //Set X and Y of node
      node.attr("r", function (d) { return d['degree_cen']; })
        .attr("cx", function (d) { return d['x']; })
        .attr("cy", function (d) { return d['y']; });
      //Set X, Y of link
      link
        .attr("x1", function (d) { return d['source']['x']; })
        .attr("y1", function (d) { return d['source']['y']; })
        .attr("x2", function (d) { return d['target']['x']; })
        .attr("y2", function (d) { return d['target']['y']; });
      //Shift node a little
      node.attr("transform", function (d) { return "translate(" + d['x'] + "," + d['y'] + ")"; });
    });

  }


  /**
   * @description draw a tree chart using the data using d3
   */

  drawTreeChart(data_str: string) {
    let data = JSON.parse(data_str);
    // let ex_data={'name': 18.0, 'children': [{'name': 13.0, 'parent': 18.0, 'children': [{'name': 9.0, 'parent': 13.0, 'children': [], 'title': '통일 이후 북한지역의 도시개발 방향에 관한 연구'}, {'name': 12.0, 'parent': 13.0, 'children': [{'name': 7.0, 'parent': 12.0, 'children': [], 'title': '새 통일 한국의 영.유아 교육 연구'}, {'name': 11.0, 'parent': 12.0, 'children': [{'name': 8.0, 'parent': 11.0, 'children': [], 'title': '민간 통일 운동의 주요 논의 동향과 통일 정책 수용여부에 관한 연구'}, {'name': 10.0, 'parent': 11.0, 'children': [{'name': 5.0, 'parent': 10.0, 'children': [], 'title': '알기쉬운 통일교육 12주제:프리젠테이션-제1부-통일비전'}, {'name': 6.0, 'parent': 10.0, 'children': [], 'title': '통일 후 남북한경제 한시분리운영방안: 노동 및 사회복지 분야'}]}]}]}]}, {'name': 17.0, 'parent': 18.0, 'children': [{'name': 1.0, 'parent': 17.0, 'children': [], 'title': '통일 비용·편익의 분석모형 구축'}, {'name': 16.0, 'parent': 17.0, 'children': [{'name': 2.0, 'parent': 16.0, 'children': [], 'title': '통일대비를 위한 국내과제'}, {'name': 15.0, 'parent': 16.0, 'children': [{'name': 0.0, 'parent': 15.0, 'children': [], 'title': '한반도 통일에 대한 국제사회의 기대와 역할: 주변 4국과 G20'}, {'name': 14.0, 'parent': 15.0, 'children': [{'name': 3.0, 'parent': 14.0, 'children': [], 'title': '통일대계 탐색연구'}, {'name': 4.0, 'parent': 14.0, 'children': [], 'title': '한반도 통일의 미래와 주변 4국의 기대'}]}]}]}]}]}
    // data=ex_data;
    let width = 600;
    const dx = width / 4;
    const dy = width / 10;
    const margin = ({ top: 10, right: 40, bottom: 10, left: 40 });

    let diagonal: Function = d3.linkHorizontal().x(d => d['y']).y(d => d['x']);

    const tree = d3.tree().nodeSize([dx, dy]);
    const root = d3.hierarchy(data);

    root['x0'] = dy / 2;
    root['y0'] = 0;
    root.descendants().forEach((d, i) => {
      d['num'] = i;
      d['_children'] = d['children'];
      // if (d['depth'] && d['data']['name']['length'] !== 7) d['children'] = null;
    });

    const svg = d3.select("figure#tree")
      .append("svg")
      .attr("id", "svgstart")
      .attr("viewBox", [-margin.left, -margin.top, width, dx].join())
      .style("font", "10px sans-serif")
      .style("user-select", "none");

    const gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {
      // const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node['x'] < left['x']) left = node;
        if (node['x'] > right['x']) right = node;
      });

      const height = right['x'] - left['x'] + margin['top'] + margin['bottom'];

      const transition = svg.transition()
        // .duration(duration)
        .attr("viewBox", [-margin['left'], left['x'] - margin['top'], width, height].join())
        .tween("resize", window['ResizeObserver'] ? null : () => () => svg.dispatch("toggle"));

      // Update the nodes…
      const node = gNode.selectAll("g")
        .data(nodes, d => d['num']);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source['y0']},${source['x0']})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          d['children'] = d['children'] ? null : d['_children'];
          update(d);
        });

      nodeEnter.append("circle")
        .attr("r", 2.5)
        .attr("fill", d => d['_children'] ? "#555" : "#999")
        .attr("stroke-width", 10);

      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d['_children'] ? -6 : 6)
        .attr("text-anchor", d => d['_children'] ? "end" : "start")
        .text(d => d.data.title ? d.data.title : null)
        .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d['y']},${d['x']})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source['y']},${source['x']})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path")
        .data(links, d => d['target']['num']);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source['x0'], y: source['y0'] };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition)
        .attr("d", <null>diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source['x'], y: source['y'] };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore(d => {
        d['x0'] = d['x'];
        d['y0'] = d['y'];
      });
    }

    update(root);

    return svg.node();
  }



  drawTopicModeling(data_str: string) {
    let data = JSON.parse(data_str);

    // let LDAvis;
    // function LDAvis_load_lib(url, callback){
    // let url = "https://cdn.jsdelivr.net/gh/bmabey/pyLDAvis@3.2.2/pyLDAvis/js/ldavis.v3.0.0.js";
    // console.log("loading lib");
    // let node = document.createElement('script');
    // node.src = url;
    // node.type = 'text/javascript';
    // node.async = true;
    // node.charset = 'utf-8';
    // document.getElementsByTagName('head')[0].appendChild(node);

    // let s = document.createElement('script');
    // s.src = url;
    // s.async = true;
    // // s.onreadystatechange =
    // node.onload = callback;
    // s.onerror = function(){
    //   console.warn("failed to load library " + url);
    // };
    // document.getElementById("topic").appendChild(s);
    // }

    // LDAvis

    // if(typeof(LDAvis) !== "undefined"){
    //   // already loaded: just create the visualization
    //   // !function(LDAvis){
    //       LDAvis = new LDAvis("#" + "ldavis", data);
    //   // }(LDAvis);
    // }
    // // else if(typeof(define) === "function" && define.amd){
    //   // require.js is available: use it to load d3/LDAvis

    //   require.config({paths: {d3: "https://d3js.org/d3.v5"}});
    //   require(["d3"], function(d3){
    //       window.d3 = d3;
    //       LDAvis_load_lib("https://cdn.jsdelivr.net/gh/bmabey/pyLDAvis@3.2.2/pyLDAvis/js/ldavis.v3.0.0.js", function(){
    //         new LDAvis("#" + "ldavis", data);
    //       });
    //     });
    // }
    // else{
    // require.js not available: dynamically load d3 & LDAvis
    // LDAvis_load_lib("https://d3js.org/d3.v5.js", function(){
    lda.ldavis('#ldavis', data);
    // LDAvis_load_lib("https://cdn.jsdelivr.net/gh/bmabey/pyLDAvis@3.2.2/pyLDAvis/js/ldavis.v3.0.0.js", function(){
    // var win = window.open('./ldavis.html', 'Topic Modeling','width=#, height=#');
    // win.document.write("<script>lda.ldavis('#ldavis', data);</script>");

    // })
    // });
    // }
  }

  /**
   * @description save chart img to Mongo DB
   */

  async saveSvg(): Promise<void> {
    const svg = d3.select("svg#svgstart");
    if (!this.analysisedData || !svg) return alert("분석이 완료되지 않았거나 문제가 발생했습니다.\n잠시후 다시 시도해주세요");

    svgAsPngUri(svg.node(), { scale: 0.2, backgroundColor: "white", excludeUnusedCss: true },).then(uri => {
      //save uri to mongo DB

      let data = JSON.stringify({
        'userEmail': this.email,
        'keyword': this.analysisedData.keyword,
        'savedDate': this.analysisedData.savedDate,
        'analysisDate': this.analysisedData.analysisDate,
        'chartImg': uri,
        'analysis': this.analysisedData.analysis,
        'option1': this.optionValue1,
        'option2': this.optionValue2,
        'option3': this.optionValue3,
        'jsonDocId': this.analysisedData.jsonDocId,
      });

      // console.log(data);
      this.middlewareService.postDataToFEDB('/textmining/uploadChart', data).then(res => {
        // alert("선택하신 차트가 내 분석함에 저장되었습니다.");
        if (confirm("선택하신 차트가 내 분석함에 저장되었습니다. 내 분석함 페이지로 이동하시겠습니까?"))
          this.toMyAnalysis();
      });

    });

  }

  downloadPng() {
    const svg = d3.select("svg#svgstart");
    saveSvgAsPng(svg.node(), "chart.png", { backgroundColor: "white" });
  }

  public get isDataAnalysised(): boolean {
    return this._isDataAnalysised;
  }
  public set isDataAnalysised(value: boolean) {
    this._isDataAnalysised = value;
  }

  public get analysisedData(): any {
    return this._analysisedData;
  }
  public set analysisedData(value: any) {
    this._analysisedData = value;
  }
}
