import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.less']
})
export class ConnectionComponent {
  keyword: string = '';  // Holds the input keyword
  searchResults: any[] = [];  // Holds the search results

  constructor(private http: HttpClient) {}

  onSearch() {
    console.log('Search initiated with keyword:', this.keyword);

    if (!this.keyword.trim()) {
      alert('Please enter a keyword!');
      return;
    }

    // Update the URL with the full address of your middleware
    const middlewareUrl = 'http://localhost:10000/esQueryTest';

    // Send the keyword to the backend
    this.http.post<any>(middlewareUrl, { keyword: this.keyword }).subscribe(
      (response) => {
        console.log('Search response received:', response);
        if (response && response.results) {
          this.searchResults = response.results;  // Assume response contains 'results' field
        
          // this.searchResults.forEach(result => {
          //   console.log('Document ID:', result._id);
          //   console.log('Document Data:', result.source);
          // });
        } else {
          this.searchResults = [];  // No results found
        }
      },
      (error) => {
        console.error('Error:', error);
        alert('An error occurred while fetching data.');
      }
    );
  }
}
