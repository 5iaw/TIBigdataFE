import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['../../middleware-style.less'],
})
export class AnalysisComponent {
  displayValue: string = '';
  private middlewareUrl = 'http://localhost:10000'; 
  
    constructor(private http: HttpClient) { }
  
    jobId: string | null = null;
  jobStatus: string = 'Waiting for job to start...';
  isJobCompleted: boolean = false;


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

  pollJobStatus() {
    // Step 2: Poll for job status until it is completed
    interval(5000)  // Poll every 5 seconds
      .pipe(
        takeWhile(() => !this.isJobCompleted),  // Stop polling once the job is completed
        switchMap(() => this.http.get<{ state: string }>('/get_job_status/' + this.jobId))
      )
      .subscribe(status => {
        if (status.state === 'success') {
          this.jobStatus = 'Job completed successfully!';
          this.isJobCompleted = true;
        } else if (status.state === 'failed') {
          this.jobStatus = 'Job failed.';
          this.isJobCompleted = true;
        } else {
          this.jobStatus = 'Job is still running...';
        }
      });
  }

}