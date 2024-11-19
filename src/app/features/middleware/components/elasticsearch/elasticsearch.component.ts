import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router  } from "@angular/router";

@Component({
  selector: 'app-elasticsearch',
  templateUrl: './elasticsearch.component.html',
})
export class ElasticSearchComponent implements OnInit {
  keyword: string = '';  // Input keyword for search
  searchResults: any[] = [];  // Holds the search results
  selectedFiles: any[] = [];  // Holds selected files

  searchQuery: string;
  connectionStatus: string = 'Checking connection...';
  private EsUrl = 'http://localhost:10000/es';  // Flask backend URL
  private AnalysisUrl = 'http://localhost:10000/spark';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  // Test connection to Elasticsearch
  testConnection(): void {
    const testUrl = `${this.EsUrl}/connTest`;  // Flask test endpoint
    this.http.get(testUrl).subscribe(
      (response) => {
        console.log('Connection to Elasticsearch successful:', response);
        this.connectionStatus = 'Connected to Elasticsearch';
      },
      (error) => {
        console.error('Unable to connect to Elasticsearch:', error);
        this.connectionStatus = 'Failed to connect to Elasticsearch';
      }
    );
}

  // Perform search query with the keyword
  onSearch(): void {
    if (this.keyword.trim()) {
      const searchUrl = `${this.EsUrl}/esQuery`;  // Flask search endpoint
      const requestBody = { keyword: this.keyword };  // Request payload

      this.http.post<any>(searchUrl, requestBody).subscribe(
        (response) => {
          if (response.results) {
            this.searchResults = response.results;  // Store the search results
            console.log('Search results:', this.searchResults);
          } else {
            console.error('No results found.');
          }
        },
        (error) => {
          console.error('Search failed:', error);
          alert('Failed to retrieve search results.');
        }
      );
    }
  }

  // Handle file selection
  onFileSelectionChange(file: any, event: any): void {
    if (event.target.checked) {
      // Add file to selected files if checked
      this.selectedFiles.push(file._id);
    } else {
      // Remove file from selected files if unchecked
      this.selectedFiles = this.selectedFiles.filter(selectedFile => selectedFile._id !== file._id);
    }
  }

  // Save selected files (triggered when 'Save Selected Files' button is clicked)
  onSaveSelectedFiles(): void {
    if (this.selectedFiles.length > 0) {
      const payload = { fileIds: this.selectedFiles };
  
      // Send file IDs to Flask middleware
      this.http.post(`${this.AnalysisUrl}/input-files`, payload).subscribe(
        (response) => {
          console.log("File IDs saved to middleware:", response);
  
          // Navigate to the analysis page
          this.router.navigate(["/middleware/analysis"]);
        },
        (error) => {
          console.error("Failed to save file IDs:", error);
          alert("Failed to save selected files. Please try again.");
        }
      );
    } else {
      alert("Please select at least one file to proceed.");
    }
  }
}
