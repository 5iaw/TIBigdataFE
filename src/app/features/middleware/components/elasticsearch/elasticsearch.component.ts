import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { UserProfile } from "src/app/core/models/user.model";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";

function encodeEmail(email: string): string {
  return btoa(email).replace(/=/g, "");
}

@Component({
  selector: 'app-elasticsearch',
  templateUrl: './elasticsearch.component.html',
  styleUrls: ["../../middleware-style.less"],
})
export class ElasticSearchComponent implements OnInit {
  keyword: string = '';  // Input keyword for search
  searchResults: any[] = [];  // Holds the search results
  selectedFiles: any[] = [];  // Holds selected files

  currentPath = "";
  owner = "";
  private currentUser: UserProfile;

  searchQuery: string;
  connectionStatus: string = 'Checking connection...';
  private EsUrl = 'http://localhost:15050/es';  // Flask backend URL
  private AnalysisUrl = 'http://localhost:15050/spark';

  private middlewareUrl = "http://localhost:15050/spark";

  // Pagination variables
  currentPage: number = 1;
  resultsPerPage: number = 25;  // Set results per page
  pagedResults: any[] = [];  // Results to display on the current page
  totalPages: number = 1;  // Total pages for pagination

  constructor(
    private authService: AuthenticationService, private router: Router,
    private http: HttpClient) {
      this.authService.getCurrentUserChange().subscribe((user) => {
        this.currentUser = user;
        this.owner = encodeEmail(this.currentUser.email); // Encode email only once and set as owner
        this.currentPath = `/users/${this.owner}/input_files/`; // Set initial path
      });
    }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  // Test connection to Elasticsearch
  testConnection(): void {
    const testUrl = `${this.EsUrl}/connTest`;  // Flask test endpoint
    const headers = { 'Content-Type': 'application/json' };

    this.http.get(testUrl, { headers }).subscribe(
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
        const headers = { 'Content-Type': 'application/json' };  // Explicitly defining headers

        this.http.post<any>(searchUrl, requestBody, { headers }).subscribe(
            (response) => {
                if (response.results) {
                    this.searchResults = response.results;  // Store the search results
                    this.totalPages = Math.ceil(this.searchResults.length / this.resultsPerPage);  // Calculate total pages
                    this.paginateResults();  // Paginate results
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


  // Paginate the search results for the current page
  paginateResults(): void {
    const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    const endIndex = startIndex + this.resultsPerPage;
    this.pagedResults = this.searchResults.slice(startIndex, endIndex);
  }

  // Navigate to a specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateResults();
    }
  }

  // Handle file selection
  onFileSelectionChange(file: any, event: any): void {
    if (event.target.checked) {
      // Add file to selected files if checked
      this.selectedFiles.push(file);
    } else {
      // Remove file from selected files if unchecked
      this.selectedFiles = this.selectedFiles.filter(selectedFile => selectedFile._id !== file._id);
    }
  }

  // Save selected files (triggered when 'Save Selected Files' button is clicked)
  onSaveSelectedFiles(): void {
    if (this.selectedFiles.length > 0) {
      const payload = { 
        path: this.currentPath,
        files: this.selectedFiles.map(file => ({ 
          id: file._id, 
          content: file.source?.post_body // Include file content 
        })) 
      };
      console.log("Sending payload to Flask:", payload);
      
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
