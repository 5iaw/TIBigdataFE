import { assertPlatform, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
// import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from "@angular/router";
import { MiddlewareService } from "../../services/middleware.service";

import { interval } from "rxjs";
import { concatMap, takeWhile, switchMap, delay } from "rxjs/operators";
import { Observable } from "rxjs";
import { HttpHeaders } from "@angular/common/http";
import * as d3 from "d3";
import { Tooltip } from "chart.js";
import * as lda from "../file-list/ldavis.v3.0.0.js";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UserProfile } from "src/app/core/models/user.model";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";
import { FileSystemEntity } from "../../models/FileSystemEntity.model";


function encodeEmail(email: string): string {
  return btoa(email).replace(/=/g, "");
}

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.component.html",
  styleUrls: ["../../middleware-style.less"],
})
export class AnalysisComponent implements OnInit {
  displayValue: string = "";
  k_value: string = "";
  w2v_value: string = "";
  tfidf_value: string = "";
  lda_value: string = "";
  sma_wordsnum: string = "";
  sma_ls: string = "";
  ngrams_value: string = "";
  ngrams_ls: string = "";
  ngrams_param: string = "";
  hcluster_value: string = "";
  ner_value: string = "";
  currentPath = "";
  fileList: string [];
  owner = "";

  activity: string = "";
  analysisedData: any;
  output_path: string;
  jobId: string | null = null;
  private currentUser: UserProfile;

  selectedFiles: string[] = [];

  private middlewareUrl = "http://localhost:10000/spark";
  constructor(
    private authService: AuthenticationService, private route: ActivatedRoute, 
    private middlewareService: MiddlewareService,
    private http: HttpClient) {
      this.authService.getCurrentUserChange().subscribe((user) => {
        this.currentUser = user;
        this.owner = encodeEmail(this.currentUser.email); // Encode email only once and set as owner
        this.currentPath = `/users/${this.owner}`; // Set initial path
      });
    }


  jobStatus: string = "Waiting for job to start...";
  isJobCompleted: boolean = false;
  loading: boolean = false;
  connectionStatus: string = "Checking connection...";
  results: string | null = null;

  ngOnInit(): void {
    // Retrieve selected file IDs from query parameters
    
  }

  testConnection(): void {
    const testUrl = `${this.middlewareUrl}/test-connection`;
    this.http.get(testUrl).subscribe(
      () => {
        console.log("Connection to middleware successful");
        this.connectionStatus = "Connected to middleware";
      },
      (error) => {
        console.error("Unable to connect to middleware:", error);
        this.connectionStatus = "Failed to connect to middleware";
      },
    );
  }

  // submitJob(): void {
  //   const selectedFileIds = this.selectedFiles;
  //   if (selectedFileIds.length === 0) {
  //     console.error("No files selected for analysis.");
  //     return;
  //   }

  //   const analysisParams: any = {
  //     owner: this.currentUser.email,
  //     input_file_ids: selectedFileIds,
  //     parent_path: this.currentPath,
  //   };

  //   switch (this.selectedAnalysisType) {
  //     case "wordcount":
  //       analysisParams.display_value = this.displayValue;
  //       break;
  //     case "kmeans":
  //       analysisParams.k_value = this.kValue;
  //       break;
  //     case "w2v":
  //       analysisParams.w2v_param = this.w2vParam;
  //       break;
  //     case "tfidf":
  //       analysisParams.tfidf_param = this.tfidfParam;
  //       break;
  //     case "lda":
  //       analysisParams.lda_param = this.ldaParam;
  //       break;
  //     case "sma":
  //       analysisParams.optionList = this.optionList;
  //       analysisParams.linkStrength = this.linkStrength;
  //       break;
  //     case "ngrams":
  //       analysisParams.optionList = this.optionList;
  //       analysisParams.n = this.nValue;
  //       analysisParams.linkStrength = this.linkStrength;
  //       break;
  //     case "hc":
  //       analysisParams.optionList = this.optionList;
  //       break;
  //     case "ner":
  //       analysisParams.nerParam = this.optionList;
  //       break;
  //   }

  //   this.middlewareService
  //     .submitAnalysis(this.selectedAnalysisType, analysisParams)
  //     .subscribe(
  //       (response) => {
  //         if (response.success) {
  //           console.log(
  //             `${this.selectedAnalysisType} analysis job submitted successfully.`,
  //             response,
  //           );

  //           // Call getAnalysisResult after successful job submission
  //           console.log("calling visualization...");
  //           this.output_path = response.output_path;
  //         } else {
  //           console.error(
  //             `Failed to submit ${this.selectedAnalysisType} analysis job:`,
  //             response.message,
  //           );
  //         }
  //       },
  //       (error) =>
  //         console.error(
  //           `Error submitting ${this.selectedAnalysisType} analysis job:`,
  //           error,
  //         ),
  //     );
  // }

  // submitWordCount(): void {
  //   if (this.displayValue && this.displayValue.trim() !== "") {

  //     console.log("Posting to ", this.middlewareUrl + "/submit_wordcount");
  //     // Prepare payload to send to backend
  //     const payload = { userEmail: this.currentUser.email, input_file_ids: this.selectedFiles, display_value: this.displayValue };
  //     console.log("Submitting WordCount job with value:", payload);

  //     this.loading = true; // Start loading
  //     // alert("Loading... Please wait."); // Display alert

  //     this.activity = "count";
  //     // Send the job submission request
  //     this.http
  //       .post(`${this.middlewareUrl}/submit_wordcount`, payload)
  //       .subscribe(
  //         (response: any) => {
  //           console.log("Job submitted successfully:", response);
  //           this.output_path = response.output_path;
  //           this.jobId = response.id; // Assuming the response contains the job ID
  //           this.jobStatus = "Job submitted, waiting for completion...";

  //           // Now, periodically check the job status
  //           this.pollJobStatus();
  //         },
  //         (error) => {
  //           console.error("Error submitting job:", error);
  //           this.jobStatus = "Failed to submit the job.";
  //           this.loading = false;
  //         },
  //       );
  //   } else {
  //     console.log("Please enter a valid display value.");
  //     this.jobStatus = "Please enter a valid display value.";
  //   }
  // }

  submitJob(selectedAnalysisType): void {
    const selectedFileIds = this.selectedFiles;
    if (selectedFileIds.length === 0) {
      console.error("No files selected for analysis.");
      return;
    }

    const analysisParams: any = {
      owner: this.owner,
      input_file_ids: selectedFileIds,
      parent_path: this.currentPath,
    };

    switch (selectedAnalysisType) {
      case "wordcount":
        analysisParams.display_value = this.displayValue;
        break;
      case "kmeans":
        analysisParams.k_value = this.k_value;
        break;
      case "w2v":
        analysisParams.w2v_param = this.w2v_value;
        break;
      case "tfidf":
        analysisParams.tfidf_param = this.tfidf_value;
        break;
      case "lda":
        analysisParams.lda_param = this.lda_value;
        break;
      case "sma":
        analysisParams.optionList = this.sma_wordsnum;
        analysisParams.linkStrength = this.sma_ls;
        break;
      case "ngrams":
        analysisParams.optionList = this.ngrams_param;
        analysisParams.n = this.ngrams_value;
        analysisParams.linkStrength = this.ngrams_ls;
        break;
      case "hc":
        analysisParams.optionList = this.hcluster_value;
        break;
      case "ner":
        analysisParams.nerParam = this.ner_value;
        break;
    }

    this.middlewareService
      .submitAnalysis(selectedAnalysisType, analysisParams)
      .subscribe(
        (response) => {
          if (response.success) {
            console.log(
              `${selectedAnalysisType} analysis job submitted successfully.`,
              response,
            );

            // Call getAnalysisResult after successful job submission
            console.log("calling visualization...");
            this.output_path = response.output_path;
          } else {
            console.error(
              `Failed to submit ${selectedAnalysisType} analysis job:`,
              response.message,
            );
          }
        },
        (error) =>
          console.error(
            `Error submitting ${selectedAnalysisType} analysis job:`,
            error,
          ),
      );
  }

  submitWordCount(): void {
    if (this.displayValue && this.displayValue.trim() !== "") {

      console.log("Posting to ", this.middlewareUrl + "/submit_wordcount");
      // Prepare payload to send to backend
      const payload = { userEmail: this.currentUser.email, display_value: this.displayValue };
      console.log("Submitting WordCount job with value:", payload);

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "count";
      // Send the job submission request
      this.http
        .post(`${this.middlewareUrl}/submit_wordcount`, payload)
        .subscribe(
          (response: any) => {
            console.log("Job submitted successfully:", response);
            this.output_path = response.output_path;
            this.jobId = response.id; // Assuming the response contains the job ID
            this.jobStatus = "Job submitted, waiting for completion...";

            // Now, periodically check the job status
            this.pollJobStatus();
          },
          (error) => {
            console.error("Error submitting job:", error);
            this.jobStatus = "Failed to submit the job.";
            this.loading = false;
          },
        );
    } else {
      console.log("Please enter a valid display value.");
      this.jobStatus = "Please enter a valid display value.";
    }
  }

  submitKMeans(): void {
    if (this.k_value && this.k_value.trim() !== "") {
      console.log("Submitting K-Means job with value:", this.k_value);

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      console.log("Posting to ", this.middlewareUrl + "/submit_kmeans");
      // Prepare payload to send to backend
      const payload = { userEmail: this.currentUser.email, k_value: this.k_value };

      this.activity = "kmeans";
      // Send the job submission request
      this.http
      .post(`${this.middlewareUrl}/submit_kmeans`, payload)
      .subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter a valid k value.");
      this.jobStatus = "Please enter a valid k value.";
    }
  }

  submitTFIDF(): void {
    if (this.tfidf_value && this.tfidf_value.trim() !== "") {
      console.log("Submitting TFIDF job with value:", this.tfidf_value);

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "tfidf";
      console.log("Posting to ", this.middlewareUrl + "/submit_tfidf");
      // Prepare payload to send to backend
      const payload = { userEmail: this.currentUser.email, tfidf_param: this.tfidf_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_tfidf`, payload).subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter a valid value.");
      this.jobStatus = "Please enter a valid value.";
    }
  }

  submitW2V(): void {
    if (this.w2v_value && this.w2v_value.trim() !== "") {
      console.log("Submitting Word2Vec job with value:", this.w2v_value);

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "word2vec";
      console.log("Posting to ", this.middlewareUrl + "/submit_w2v");
      // Prepare payload to send to backend
      const payload = { userEmail: this.currentUser.email, w2v_param: this.w2v_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_w2v`, payload).subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter a valid value.");
      this.jobStatus = "Please enter a valid value.";
    }
  }

  submitLDA(): void {
    if (this.lda_value && this.lda_value.trim() !== "") {
      console.log("Submitting Topic LDA job with value:", this.lda_value);

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "topicLDA";
      console.log("Posting to ", this.middlewareUrl + "/submit_lda");
      // Prepare payload to send to backend
      const payload = { userEmail: this.currentUser.email, lda_param: this.lda_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_lda`, payload).subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter a valid value.");
      this.jobStatus = "Please enter a valid value.";
    }
  }

  submitSMA(): void {
    // skipped
    if (this.sma_wordsnum && this.sma_ls) {
      console.log(
        "Submitting Semantic Network Analysis with params:",
        this.sma_wordsnum,
        this.sma_ls,
      );

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "network";
      // Prepare payload with both parameters
      const payload = {
        userEmail: this.currentUser.email,
        optionList: this.sma_wordsnum,
        linkStrength: this.sma_ls,
      };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_sma`, payload).subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Poll job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter valid parameters.");
      this.jobStatus = "Please enter valid parameters.";
    }
  }

  submitNgrams(): void {
    if (this.ngrams_value && this.ngrams_ls && this.ngrams_param) {
      console.log(
        "Submitting N-Grams Analysis with params:",
        this.ngrams_ls,
        this.ngrams_param,
        this.ngrams_ls,
      );

      this.loading = true; // Start loading
      // alert("Loading... Please wait."); // Display alert

      this.activity = "ngrams";
      // Prepare payload with both parameters
      const payload = {
        userEmail: this.currentUser.email,
        optionList: this.ngrams_value,
        n: this.ngrams_param,
        linkStrength: this.ngrams_ls,
      };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_ngrams`, payload).subscribe(
        (response: any) => {
          console.log("Job submitted successfully:", response);
          this.output_path = response.output_path;
          this.jobId = response.id; // Assuming the response contains the job ID
          this.jobStatus = "Job submitted, waiting for completion...";

          // Poll job status
          this.pollJobStatus();
        },
        (error) => {
          console.error("Error submitting job:", error);
          this.jobStatus = "Failed to submit the job.";
          this.loading = false;
        },
      );
    } else {
      console.log("Please enter valid parameters.");
      this.jobStatus = "Please enter valid parameters.";
    }
  }

  submitHclustering(): void {
    this.loading = true; // Start loading
    // alert("Loading... Please wait."); // Display alert

    this.activity = "hc";
    console.log("Posting to ", this.middlewareUrl + "/submit_hclustering");
    // Prepare payload to send to backend
    const payload = { userEmail: this.currentUser.email };

    // Send the job submission request
    this.http.post(`${this.middlewareUrl}/submit_hclustering`, payload).subscribe(
      (response: any) => {
        console.log("Job submitted successfully:", response);
        this.output_path = response.output_path;
        this.jobId = response.id; // Assuming the response contains the job ID
        this.jobStatus = "Job submitted, waiting for completion...";

        // Now, periodically check the job status
        this.pollJobStatus();
      },
      (error) => {
        console.error("Error submitting job:", error);
        this.jobStatus = "Failed to submit the job.";
        this.loading = false;
      },
    );
}

submitNER(): void {
  if (this.ner_value && this.ner_value.trim() !== "") {
    console.log("Submitting NER job with value:", this.ner_value);

    this.loading = true; // Start loading
    // alert("Loading... Please wait."); // Display alert

    this.activity = "ner";
    console.log("Posting to ", this.middlewareUrl + "/submit_ner");
    // Prepare payload to send to backend
    const payload = { userEmail: this.currentUser.email, ner_param: this.ner_value };

    // Send the job submission request
    this.http.post(`${this.middlewareUrl}/submit_ner`, payload).subscribe(
      (response: any) => {
        console.log("Job submitted successfully:", response);
        this.output_path = response.output_path;
        this.jobId = response.id; // Assuming the response contains the job ID
        this.jobStatus = "Job submitted, waiting for completion...";

        // Now, periodically check the job status
        this.pollJobStatus();
      },
      (error) => {
        console.error("Error submitting job:", error);
        this.jobStatus = "Failed to submit the job.";
        this.loading = false;
      },
    );
  } else {
    console.log("Please enter a valid value.");
    this.jobStatus = "Please enter a valid value.";
  }
}
submitSentiment(): void {
  
}

  // submitNER(): void {
  //     this.loading = true; // Start loading
  //     // alert("Loading... Please wait."); // Display alert

  //     this.activity = "ner";
  //     console.log("Posting to ", this.middlewareUrl + "/submit_ner");
  //     // Prepare payload to send to backend
  //     const payload = { userEmail: this.currentUser.email };

  //     // Send the job submission request
  //     this.http.post(`${this.middlewareUrl}/submit_ner`, payload).subscribe(
  //       (response: any) => {
  //         console.log("Job submitted successfully:", response);
  //         this.output_path = response.output_path;
  //         this.jobId = response.id; // Assuming the response contains the job ID
  //         this.jobStatus = "Job submitted, waiting for completion...";

  //         // Now, periodically check the job status
  //         this.pollJobStatus();
  //       },
  //       (error) => {
  //         console.error("Error submitting job:", error);
  //         this.jobStatus = "Failed to submit the job.";
  //         this.loading = false;
  //       },
  //     );
  // }

  //   poll for 10s each
  pollJobStatus(): void {
    const jobStatusSubscription = interval(3000)
      .pipe(
        takeWhile(() => !this.isJobCompleted), // Stop polling once the job is completed
        switchMap(() => this.getJobStatus(Number(this.jobId))), // Fetch job status from Flask
      )
      .subscribe(
        (status) => {
          if (status.state === "success") {
            this.jobStatus = "Job completed successfully!";
            this.isJobCompleted = true;
            this.loading = false; // Stop loading
            console.log(this.getAnalysisResult());
            jobStatusSubscription.unsubscribe();
          } else if (status.state === "failed") {
            this.jobStatus = "Job failed.";
            this.isJobCompleted = true;
            this.loading = false; // Stop loading
            jobStatusSubscription.unsubscribe();
          } else {
            this.jobStatus = "Job is still running...";
          }
          console.log("Job status:  ", this.jobStatus);
        },
        (error) => {
          console.error("Error fetching job status:", error);
        },
      );
  }

  // Remember to check jobId
  getJobStatus(jobId: number) {
    const url = `${this.middlewareUrl}/status/${jobId}`; // Flask backend URL (update the port if needed)
    console.log("Getting results from ", url);
    return this.http.get<{ state: string }>(url);
  }


// getAnalysisResult() {
//   const url = `${this.middlewareUrl}/read_file?output_path=${(this.output_path)}`;
//   console.log("Getting results from ", url);

//   this.http.get<{ file_content: string }>(url).subscribe(
//     (response) => {
//       this.analysisedData = response;  // Adjust if file_content is directly returned
//       console.log("Analysis result:", this.analysisedData);
//       console.log("Result graph:", JSON.stringify(this.analysisedData.result_graph));
//     },
//     (error) => {
//       console.error("Error fetching analysis result:", error);
//     },
//   );



//     if(this.activity=='count'|| this.activity=='tfidf'){
//       this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));
//       this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
//       }}

getAnalysisResult() {
  const url = `${this.middlewareUrl}/read_file?output_path=${encodeURIComponent(this.output_path)}`;
  console.log("Getting results from ", url);

  this.http.get<{ file_content: string }>(url).subscribe(
    (response) => {
      this.analysisedData = response;  // Adjust if file_content is directly returned
      console.log("Analysis result:", this.analysisedData);

      this.displayValue = "";
      this.output_path = "";
      this.jobId = null;
      this.isJobCompleted = false;
      this.jobStatus = "";

      // Check if result_graph is defined before logging or using it
      // if (this.analysisedData.result_graph) {
      //     console.log("Result graph:", JSON.stringify(this.analysisedData.result_graph));

          // call visualization
        this.drawResultVisualizations();
      // } else {
      //     console.error("result_graph is undefined");
      // }
    },
    (error) => {
      console.error("Error fetching analysis result:", error);
    },
  );
}


drawResultVisualizations(): void {
  if (this.analysisedData && this.analysisedData.result_graph) {
    console.log("Drawing visualizations...");
    // Add visualization logic here
    if (this.activity === 'count' || this.activity === 'tfidf') {
        this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));
        this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
      }
    else if(this.activity=='network'){
      // this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_table));
      this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
    }
    else if(this.activity=='ngrams'){
      this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
    }
    else if(this.activity=='kmeans'){
      this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));
      this.drawScatterChart(JSON.stringify(this.analysisedData.result_graph));
    }
    else if(this.activity=='word2vec'){
      // this.drawTable(activity, JSON.stringify(this.analysisedData.result_graph));
      this.drawScatterWordChart(JSON.stringify(this.analysisedData.result_graph));
    }
    else if(this.activity=='hcluster')
      this.drawTreeChart(JSON.stringify(this.analysisedData.result_graph));
    // }
    else if(this.activity=='topicLDA')
      this.drawTopicModeling(JSON.stringify(this.analysisedData.result_graph));

    else if(this.activity=='ner')
      this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));

    alert("분석 완료되었습니다.");
    // this.closeLoadingWithMask();
  }

  }
      // if (this.activity === 'count' || this.activity === 'tfidf') {
      //   this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));
      //   this.drawBarChart(JSON.stringify(this.analysisedData.result_graph));
      // }
  //   else if(this.activity=='network'){
  //     this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_table));
  //     this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(this.activity=='ngrams'){
  //     this.drawNetworkChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(this.activity=='kmeans'){
  //     this.drawTable(this.activity, JSON.stringify(this.analysisedData.result_graph));
  //     this.drawScatterChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(this.activity=='word2vec'){
  //     // this.drawTable(activity, JSON.stringify(this.analysisedData.result_graph));
  //     this.drawScatterWordChart(JSON.stringify(this.analysisedData.result_graph));
  //   }
  //   else if(this.activity=='hcluster')
  //     this.drawTreeChart(JSON.stringify(this.analysisedData.result_graph));
  //   // }
  //   else if(this.activity=='topicLDA')
  //     this.drawTopicModeling(JSON.stringify(this.analysisedData.result_graph));

  //   alert("분석 완료되었습니다.");
  //   // this.closeLoadingWithMask();
  // }

  drawTable(analType:string, data_str:string){
    let data:any = JSON.parse(data_str);

    const table = d3.select("figure#table")
      .attr('class','result-pretable')
      .append("table")
      .attr('width','100%')
      .attr('height','300px')

    if(analType=='count'||analType=='tfidf'){
      const th = table.append("tr")
      .style('padding','15px 0px')
      .style('font-weight','500')
      .style('text-align','center');

      th.append('th').text('No');
      th.append('th').text('단어');
      th.append('th').text('값');

      const tbody = table.append("tbody")
      .style('text-align','center');

      for(let i=0;i<data.length;i++){
        const tr = tbody.append("tr");
        tr.append("td").text(i+1);
        tr.append("td").text(data[i]['word']);
        tr.append("td").text(data[i]['value']);
      }
    }

    else if(analType=='kmeans'){
      const th = table.append("tr")
      .style('padding','15px 0px')
      .style('font-weight','500')
      .style('text-align','center');

      th.append('th').text('category');
      th.append('th').text('title');
      // th.append('th').text('값');

      const tbody = table.append("tbody")
      .style('text-align','center');

      let max=0;
      for(let i=0;i<data.length;i++){
        if(data[i]['category']>max)
          max=data[i]['category'];
      }

      for(let i=0;i<=max;i++){
        const tr = tbody.append("tr");
        tr.append("td").text(i+1);
        const td=tr.append("td");
        for(let j=0;j<data.length;j++){
          if(data[j]['category']==i){
            td.append("ul").text(data[j]['title']);
          }
        }
        // tr.append("td").text(data[i]['value']);
      }
    }

    else if(analType=='network'){
      const th = table.append("tr")
      .style('padding','15px 0px')
      .style('font-weight','500')
      .style('text-align','center');

      th.append('th').attr('width','10%').text('index');
      th.append('th').attr('width','18%').text('사이중심성');
      th.append('th').attr('width','18%').text('근접중심성');
      th.append('th').attr('width','18%').text('빈도수');
      th.append('th').attr('width','18%').text('연결중심성');
      th.append('th').attr('width','18%').text('eigenvector');

      // th.append('th').text('값');

      console.log(data);
      const tbody = table.append("tbody")
      .style('text-align','center');

      for(let i=0;i<data['between_cen'].length;i++){
        const tr = tbody.append("tr");
        tr.append("td").text(i+1);
        // tr.append("td").text(data['between_cen'][i]['word']+'/'+ Math.floor(data['between_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['closeness_cen'][i]['word']+'/'+ Math.floor(data['closeness_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['count'][i]['word']+'/'+ Math.floor(data['count'][i]['value']*1000)/1000);
        // tr.append("td").text(data['degree_cen'][i]['word']+'/'+ Math.floor(data['degree_cen'][i]['value']*1000)/1000);
        // tr.append("td").text(data['eigenvector_cen'][i]['word']+'/'+ Math.floor(data['eigenvector_cen'][i]['value']*1000)/1000);

        tr.append("td").text(data['between_cen'][i]['word']+'/'+ data['between_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['closeness_cen'][i]['word']+'/'+ data['closeness_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['count'][i]['word']+'/'+ data['count'][i]['value'].toExponential(3));
        tr.append("td").text(data['degree_cen'][i]['word']+'/'+ data['degree_cen'][i]['value'].toExponential(3));
        tr.append("td").text(data['eigenvector_cen'][i]['word']+'/'+ data['eigenvector_cen'][i]['value'].toExponential(3));
        // tr.append("td").text(data[i]['value']);
      }
    }
  }

  /**
   * @description draw a bar chart using the data using d3
   */

  drawBarChart(data_str:string){
    let data:Array<{word:string,value:number}> = JSON.parse(data_str);

    // console.log(data);
    // let data=[
    //   {word:"북한",count:10},
    //   {word:"통일",count:9},
    //   {word:"문재인",count:9},
    //   {word:"박근혜",count:8}
    // ];

    let margin = ({top: 20, right: 0, bottom: 30, left: 40});
    let width = 1000;
    let height = 500;

    function zoom(svg) {
      const extent : [[number,number],[number,number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

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
      .attr("id","svgstart")
      .attr("viewBox", "0, 0," + width+","+ height)
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
    .on("mouseover",function(e,d){
      tooltip
        .html("Word: " + d.word + "<br>" + "Value: " + d.value)
        .style("opacity", 1)
      d3.select(this).attr("fill","red")})
    .on("mousemove", function(e, d) {
      tooltip
      .style("left", (e.pageX+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (e.pageY) + "px")})
    .on("mouseout",function(){
      d3.select(this).attr("fill","steelblue");
      tooltip.style("opacity", 0);});

    // Draw the X-axis on the DOM
    svg.append("g")
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Draw the Y-axis on the DOM
    svg.append("g")
      .attr("class","y-axis")
      .call(yAxis);

    // Draw a tooltip
    const tooltip = d3.select("figure#bar")
      .append("div")
      .style("opacity", 0)
      .style("position","absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  }

  /**
   * @description draw a scatter chart using the data using d3
   */

  drawScatterChart(data_str:string){
    let data:Array<{
          "category" : number,
          "title" : string,
          "x" : number,
          "y" : number
      }>= JSON.parse(data_str);

    let margin = ({top: 10, right: 30, bottom: 30, left: 60});
    let  width = 750 - margin.left - margin.right;
    let height = 750 - margin.top - margin.bottom;

    function zoom(svg) {
      const extent : [[number,number],[number,number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

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
    .range([ 0, width ]);

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    .range([ height, 0]);

    // append the svg object to the body of the page
    const svg = d3.select("figure#scatter")
      .append("svg")
      .attr("id","svgstart")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0, 0," + (width + margin.left + margin.right)+","+  (height + margin.top + margin.bottom))
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
    const highlight = function(e,d){
      let category = d.category;
      let colorset = <string> color(category);
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
        .html("Title: "+d.title +"<br>category: "+d.category)
        .style("opacity", 1)

      d3.selectAll(".dottext")
        .style("opacity", 0)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function(e,d){
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", 5)

      tooltip
      .style("opacity", 0)
      .style("left",  "0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
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
      .attr("class", function (d) { return "dot type" + d.category} )
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("r", 5)
      .style("fill", function(d){return color[d['category']]} )
    .on("mouseover", highlight)
    .on("mouseout", doNotHighlight )
    .on("mousemove", function(e) {
      tooltip
      .style("left", (e.pageX+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
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
      .style("position","absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
  }

  /**
   * @description draw a scatter chart for word-2-vec using the data using d3
   */

   drawScatterWordChart(data_str:string){
    let data:Array<{
          "word" : string,
          "x" : number,
          "y" : number,
          "wcount": number
      }>= JSON.parse(data_str);

    const normWcount = d3.scaleLinear()
      .domain(d3.extent(data, d=> +d['wcount']))
      .range([1,2])

    let margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 750 - margin.left - margin.right,
      height = 750 - margin.top - margin.bottom;

    function zoom(svg) {
      const extent : [[number,number],[number,number]] = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

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
    .range([ 0, width ]);

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    .range([ height, 0]);

    // append the svg object to the body of the page
    const svg = d3.select("figure#scatter")
      .append("svg")
      .attr("id","svgstart")
      .attr("viewBox", "0, 0," + (width + margin.left + margin.right)+","+  (height + margin.top + margin.bottom))
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
    const highlight = function(e,d){
      console.log(e)

      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", d=> 15*(normWcount(d['wcount'])))

      d3.selectAll(".type" + d.word)
        .transition()
        .duration(200)
        .style("fill", "red")
        .attr("r", d=> 35*(normWcount(d['wcount'])))

      tooltip
        .html("Word: "+d.word +"<br>x: " + d.x + "<br>y: " + d.y)
        .style("opacity", 1)

      d3.selectAll(".dottext")
        .style("opacity", 0)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function(e,d){
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "lightgrey")
        .attr("r", d=>5*(normWcount(d['wcount'])))

      tooltip
      .style("opacity", 0)
      .style("left",  "0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
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
      .attr("class", function (d) { return "dot type" + d.word} )
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("r", d=> 5*(normWcount(d['wcount'])))
      .style("fill", "black")
    .on("mouseover", highlight)
    .on("mouseout", doNotHighlight )
    .on("mousemove", function(e) {
      tooltip
      .style("left", (e.pageX+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (e.pageY) + "px");
    });

    // After discussion
    svg.append('g')
    .selectAll("dottext")
    .data(data)
    .enter()
    .append("text")
      .attr("class","dottext")
      .text(d=>d.word)
      .attr("x",d=>(x(d.x)+5))
      .attr("y",d=>(y(d.y)-3))
      .style("font-size", "10px")

    // Draw a tooltip
    const tooltip = d3.select("figure#scatter")
      .append("div")
      .style("opacity", 0)
      .style("position","absolute")
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

   drawNetworkChart(data_str:string){
    let data:any
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
        .domain(d3.extent(data['nodes'], d=> +d['count']))
        .range([0,1])

  const normWeight = d3.scaleLinear()
        .domain(d3.extent(data['links'], d=> +d['weight']))
        .range([0,1])

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
    .attr("id","svgstart")
      .attr("viewBox", "0, 0," + (width + margin.left + margin.right)+","+  (height + margin.top + margin.bottom))
      .call(d3.zoom()
      //   .extent([[0, 0], [width, height]])
      //   .scaleExtent([1, 10])
        .on("zoom", function (e,d) {
        g.attr("transform", e.transform)
     }))

  var g = svg.append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")")

  //Load External Data
  // d3.json("got_social_graph.json", function(dataset){

  	//Create Force Layout
  	var force = d3.forceSimulation(nodes)
      .force("link", d3.forceLink()                               // This force provides links between nodes
      .id(function(d) { return d['id']; })                     // This provide  the id of a node
      .links(data.links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-200))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2))

    // Highlight the specie that is hovered
    const highlight = function(e,d){
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
    const doNotHighlight = function(e,d){
      d3.selectAll(".dot")
        .transition()
        .duration(200)
        .style("fill", "#7FB5FF")
        .attr("r", function(d){ return normCount(d['count'])*7 < 1 ? 1: normCount(d['count']*7) })

      d3.selectAll(".dottext")
        .style("opacity", 1)
    }

  	//Add links to SVG
  	var link = g.selectAll(".link")
  				.data(links)
  				.enter()
  				.append("line")
            .style("stroke-width", function(d){ return normWeight(d['weight'])*5 < 1 ? 1 :normWeight(d['weight'])*5 })
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
  					.attr("font-size",function(d){ return normCount(d['count'])*12 < 1 ? 9: normCount(d['count'])*12 })
  					.text(function(d){ return d['name']; });

  	//Add circles to each node
  	var circle = node.append("circle")
      .attr("r", function(d){ return normCount(d['count'])*7 < 1 ? 1: normCount(d['count'])*7 })
      .attr("fill", "#7FB5FF")
      // .attr("fill", function(d){ return color(d['id']); })
      .attr("class", function (d) { return "dot type" + d['id']} )
      .on("mouseover", highlight)
      .on("mouseout", doNotHighlight )

  	//This function will be executed for every tick of force layout
  	force.on("tick", function(){
  		//Set X and Y of node
  		node.attr("r", function(d){ return d['degree_cen']; })
  			.attr("cx", function(d){ return d['x']; })
  			.attr("cy", function(d){ return d['y']; });
  		//Set X, Y of link
      link
        .attr("x1", function(d) { return d['source']['x']; })
        .attr("y1", function(d) { return d['source']['y']; })
        .attr("x2", function(d) { return d['target']['x']; })
        .attr("y2", function(d) { return d['target']['y']; });
  		//Shift node a little
  	    node.attr("transform", function(d) { return "translate(" + d['x'] + "," + d['y'] + ")"; });
    });

   }

  /**
   * @description draw a tree chart using the data using d3
   */

  drawTreeChart(data_str:string){
    let data = JSON.parse(data_str);
    // let ex_data={'name': 18.0, 'children': [{'name': 13.0, 'parent': 18.0, 'children': [{'name': 9.0, 'parent': 13.0, 'children': [], 'title': '통일 이후 북한지역의 도시개발 방향에 관한 연구'}, {'name': 12.0, 'parent': 13.0, 'children': [{'name': 7.0, 'parent': 12.0, 'children': [], 'title': '새 통일 한국의 영.유아 교육 연구'}, {'name': 11.0, 'parent': 12.0, 'children': [{'name': 8.0, 'parent': 11.0, 'children': [], 'title': '민간 통일 운동의 주요 논의 동향과 통일 정책 수용여부에 관한 연구'}, {'name': 10.0, 'parent': 11.0, 'children': [{'name': 5.0, 'parent': 10.0, 'children': [], 'title': '알기쉬운 통일교육 12주제:프리젠테이션-제1부-통일비전'}, {'name': 6.0, 'parent': 10.0, 'children': [], 'title': '통일 후 남북한경제 한시분리운영방안: 노동 및 사회복지 분야'}]}]}]}]}, {'name': 17.0, 'parent': 18.0, 'children': [{'name': 1.0, 'parent': 17.0, 'children': [], 'title': '통일 비용·편익의 분석모형 구축'}, {'name': 16.0, 'parent': 17.0, 'children': [{'name': 2.0, 'parent': 16.0, 'children': [], 'title': '통일대비를 위한 국내과제'}, {'name': 15.0, 'parent': 16.0, 'children': [{'name': 0.0, 'parent': 15.0, 'children': [], 'title': '한반도 통일에 대한 국제사회의 기대와 역할: 주변 4국과 G20'}, {'name': 14.0, 'parent': 15.0, 'children': [{'name': 3.0, 'parent': 14.0, 'children': [], 'title': '통일대계 탐색연구'}, {'name': 4.0, 'parent': 14.0, 'children': [], 'title': '한반도 통일의 미래와 주변 4국의 기대'}]}]}]}]}]}
    // data=ex_data;
    let width = 600;
    const dx = width/4;
    const dy = width/10;
    const margin = ({top: 10, right: 40, bottom: 10, left: 40});

    let diagonal:Function = d3.linkHorizontal().x(d => d['y']).y(d => d['x']);

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
      .attr("id","svgstart")
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
          .text(d => d.data.title? d.data.title: null)
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
          const o = {x: source['x0'], y: source['y0']};
          return diagonal({source: o, target: o});
        });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", <null>diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
              const o = {x: source['x'], y: source['y']};
              return diagonal({source: o, target: o});
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

  drawTopicModeling(data_str:string){
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
}
