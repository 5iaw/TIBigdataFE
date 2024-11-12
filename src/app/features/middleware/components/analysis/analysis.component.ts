import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';
import { concatMap, takeWhile, switchMap, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['../../middleware-style.less'],
})
export class AnalysisComponent implements OnInit {
  displayValue: string = '';
  k_value: string='';
  w2v_value: string='';
  tfidf_value: string='';
  lda_value: string='';
  sma_wordsnum: string='';
  sma_ls: string='';
  ngrams_value: string='';
  ngrams_ls: string='';
  ngrams_param:string='';

  private middlewareUrl = 'http://localhost:10000/spark'; 
  
    constructor(private http: HttpClient) { }
  
    jobId: string | null = null;
  jobStatus: string = 'Waiting for job to start...';
  isJobCompleted: boolean = false;
  connectionStatus: string = 'Checking connection...';
  results: string | null =  null;
  path: string = 'flask/web_upload_file1.txt'

  ngOnInit(): void {
    this.testConnection(); // Check connection to middleware on initialization
  }

  testConnection(): void {
    const testUrl = `${this.middlewareUrl}/test-connection`;
    this.http.get(testUrl).subscribe(
      () => {
        console.log('Connection to middleware successful');
        this.connectionStatus = 'Connected to middleware';
      },
      (error) => {
        console.error('Unable to connect to middleware:', error);
        this.connectionStatus = 'Failed to connect to middleware';
      }
    );
  }


//   private initialInterval: number = 30000; // 30 seconds for the first poll
//   private subsequentInterval: number = 3000; // 3 seconds for subsequent polls
//   private currentInterval: number = this.initialInterval; // Start with the initial interval

//   submitWordCount(displayValue: string) {
//     const payload = { display_value: displayValue };

//     // Step 1: Submit the job and get the job ID
//     this.http.post<{ job_id: string }>('{this.apiUrl}/submit_wordcount', payload)
//       .subscribe(response => {
//         this.jobId = response.job_id;
//         this.jobStatus = 'Job submitted, waiting for completion...';
//         this.pollJobStatus();  // Start polling for job status
//       });
//   }

submitWordCount(): void {
    if (this.displayValue && this.displayValue.trim() !== '') {
      console.log('Submitting WordCount job with value:', this.displayValue);

    console.log("Posting to ",  this.middlewareUrl + "/submit_wordcount");
      // Prepare payload to send to backend
      const payload = { display_value: this.displayValue };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_wordcount`, payload).subscribe(
        (response: any) => {
          console.log('Job submitted successfully:', response);
          this.jobId = response.id;  // Assuming the response contains the job ID
          this.jobStatus = 'Job submitted, waiting for completion...';

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error('Error submitting job:', error);
          this.jobStatus = 'Failed to submit the job.';
        }
      );
    } else {
      console.log('Please enter a valid display value.');
      this.jobStatus = 'Please enter a valid display value.';
    }
  }

  submitKMeans(): void {
    if (this.k_value && this.k_value.trim() !== '') {
      console.log('Submitting K-Means job with value:', this.k_value);

    console.log("Posting to ",  this.middlewareUrl + "/submit_kmeans");
      // Prepare payload to send to backend
      const payload = { k_value: this.k_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_kmeans`, payload).subscribe(
        (response: any) => {
          console.log('Job submitted successfully:', response);
          this.jobId = response.id;  // Assuming the response contains the job ID
          this.jobStatus = 'Job submitted, waiting for completion...';

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error('Error submitting job:', error);
          this.jobStatus = 'Failed to submit the job.';
        }
      );
    } else {
      console.log('Please enter a valid k value.');
      this.jobStatus = 'Please enter a valid k value.';
    }
  }

  submitTFIDF(): void {
    if (this.tfidf_value && this.tfidf_value.trim() !== '') {
      console.log('Submitting TFIDF job with value:', this.tfidf_value);

    console.log("Posting to ",  this.middlewareUrl + "/submit_tfidf");
      // Prepare payload to send to backend
      const payload = { tfidf_param: this.tfidf_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_tfidf`, payload).subscribe(
        (response: any) => {
          console.log('Job submitted successfully:', response);
          this.jobId = response.id;  // Assuming the response contains the job ID
          this.jobStatus = 'Job submitted, waiting for completion...';

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error('Error submitting job:', error);
          this.jobStatus = 'Failed to submit the job.';
        }
      );
    } else {
      console.log('Please enter a valid value.');
      this.jobStatus = 'Please enter a valid value.';
    }
  }

  submitW2V(): void {
    if (this.w2v_value && this.w2v_value.trim() !== '') {
      console.log('Submitting Word2Vec job with value:', this.w2v_value);

    console.log("Posting to ",  this.middlewareUrl + "/submit_w2v");
      // Prepare payload to send to backend
      const payload = { w2v_param: this.w2v_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_w2v`, payload).subscribe(
        (response: any) => {
          console.log('Job submitted successfully:', response);
          this.jobId = response.id;  // Assuming the response contains the job ID
          this.jobStatus = 'Job submitted, waiting for completion...';

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error('Error submitting job:', error);
          this.jobStatus = 'Failed to submit the job.';
        }
      );
    } else {
      console.log('Please enter a valid value.');
      this.jobStatus = 'Please enter a valid value.';
    }
  }

  submitLDA(): void {
    if (this.lda_value && this.lda_value.trim() !== '') {
      console.log('Submitting Topic LDA job with value:', this.lda_value);

    console.log("Posting to ",  this.middlewareUrl + "/submit_lda");
      // Prepare payload to send to backend
      const payload = { lda_param: this.lda_value };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_lda`, payload).subscribe(
        (response: any) => {
          console.log('Job submitted successfully:', response);
          this.jobId = response.id;  // Assuming the response contains the job ID
          this.jobStatus = 'Job submitted, waiting for completion...';

          // Now, periodically check the job status
          this.pollJobStatus();
        },
        (error) => {
          console.error('Error submitting job:', error);
          this.jobStatus = 'Failed to submit the job.';
        }
      );
    } else {
      console.log('Please enter a valid value.');
      this.jobStatus = 'Please enter a valid value.';
    }
  }

  submitSMA(): void {  // skipped
    if (this.sma_wordsnum && this.sma_ls) {
        console.log('Submitting Semantic Network Analysis with params:', this.sma_wordsnum, this.sma_ls);

        // Prepare payload with both parameters
        const payload = { optionList: this.sma_wordsnum, linkStrength: this.sma_ls };

        // Send the job submission request
        this.http.post(`${this.middlewareUrl}/submit_sma`, payload).subscribe(
            (response: any) => {
                console.log('Job submitted successfully:', response);
                this.jobId = response.id;  // Assuming the response contains the job ID
                this.jobStatus = 'Job submitted, waiting for completion...';

                // Poll job status
                this.pollJobStatus();
            },
            (error) => {
                console.error('Error submitting job:', error);
                this.jobStatus = 'Failed to submit the job.';
            }
        );
    } else {
        console.log('Please enter valid parameters.');
        this.jobStatus = 'Please enter valid parameters.';
    }
}

submitNgrams(): void {  
  if (this.ngrams_value && this.ngrams_ls && this.ngrams_param) {
      console.log('Submitting Semantic Network Analysis with params:', this.ngrams_ls, this.ngrams_param, this.ngrams_ls);

      // Prepare payload with both parameters
      const payload = { optionList: this.ngrams_value, n: this.ngrams_param, linkStrength: this.ngrams_ls };

      // Send the job submission request
      this.http.post(`${this.middlewareUrl}/submit_ngrams`, payload).subscribe(
          (response: any) => {
              console.log('Job submitted successfully:', response);
              this.jobId = response.id;  // Assuming the response contains the job ID
              this.jobStatus = 'Job submitted, waiting for completion...';

              // Poll job status
              this.pollJobStatus();
          },
          (error) => {
              console.error('Error submitting job:', error);
              this.jobStatus = 'Failed to submit the job.';
          }
      );
  } else {
      console.log('Please enter valid parameters.');
      this.jobStatus = 'Please enter valid parameters.';
  }
}

//   poll for 10s each
  pollJobStatus(): void {
    // Poll every 15 seconds until the job is completed
    interval(3000) // Poll every 15 seconds
      .pipe(
        takeWhile(() => !this.isJobCompleted), // Stop polling once the job is completed
        switchMap(() => this.getJobStatus(Number(this.jobId))) // Fetch job status from Flask
      )
      .subscribe(
        status => {
          if (status.state === 'success') {
            this.jobStatus = 'Job completed successfully!';
            this.isJobCompleted = true;
            console.log(this.getAnalysisResult(this.path));

          } else if (status.state === 'failed') {
            this.jobStatus = 'Job failed.';
            this.isJobCompleted = true;
          } else {
            this.jobStatus = 'Job is still running...';
          }
          console.log('Job status:  ', this.jobStatus);
        },
        error => {
          console.error('Error fetching job status:', error);
        }
      );
  }


// pollJobStatus(): void {
//     let firstPollDone = false;

//     interval(this.initialInterval) // Start with the initial 30 seconds interval
//       .pipe(
//         takeWhile(() => !this.isJobCompleted), // Stop polling once the job is completed
//         switchMap(() => this.getJobStatus(Number(this.jobId))), // Fetch job status from Flask
//         concatMap((status) => {
//           // Log the job status response to check its structure
//           console.log('Job Status Response:', status);
          
//           if (status.state === 'success' || status.state === 'failed') {
//             // If job is complete or failed, stop polling
//             this.isJobCompleted = true;
//             this.jobStatus = status.state === 'success' ? 'Job completed successfully!' : 'Job failed.';
//             return new Observable<void>(); // End the stream when the job completes
//           } else {
//             // If job is still running, check if the first poll is done
//             if (!firstPollDone) {
//               firstPollDone = true;
//               // After the first poll, switch to 3-second polling interval
//               return interval(this.subsequentInterval).pipe(
//                 switchMap(() => this.getJobStatus(Number(this.jobId))) // Continue checking the job status
//               );
//             } else {
//               return interval(this.subsequentInterval).pipe(
//                 switchMap(() => this.getJobStatus(Number(this.jobId))) // Continue checking with 3 seconds interval
//               );
//             }
//           }
//         })
//       )
//       .subscribe(
//         status => {
//           if (this.isJobCompleted) {
//             // Ensure job status is updated correctly
//             console.log('Final Job Status: ', this.jobStatus);
//           } else {
//             this.jobStatus = 'Job is still running...';
//             console.log('Job status: ', this.jobStatus);
//           }
//         },
//         error => {
//           console.error('Error fetching job status:', error);
//         }
//       );
//   }

  // Remember to check jobId
  getJobStatus(jobId: number) {
    const url = `${this.middlewareUrl}/status/${jobId}`; // Flask backend URL (update the port if needed)
    console.log("Getting results from ", url);
    return this.http.get<{ state: string }>(url);
  }

  getAnalysisResult(path: string) {
    const url = `${this.middlewareUrl}/analysis/${path}`; // Flask backend URL to get analysis result
    console.log("Getting results from ", url);
    this.http.get<{ result: string }>(url).subscribe(
      (response) => {
        console.log('Analysis result:', response.result);
        //this.displayAnalysisResult(response.result); // Update UI with the result
      },
      (error) => {
        console.error('Error fetching analysis result:', error);
      }
    );
  }

}