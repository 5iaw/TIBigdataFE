import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent {
  esId: string = '';
  owner: string = '';
  message: string = '';
  private apiUrl = 'http://localhost:10000/transfer';

  constructor(private http: HttpClient) {}

  transferToHdfs(): void {
    // Check if both fields have values
    if (!this.esId || !this.owner) {
      this.message = 'Please enter both the Elasticsearch ID and Owner ID';
      return;
    }

    const payload = {
      es_id: this.esId,
      owner: this.owner
    };

    this.http.post<any>(this.apiUrl, payload).subscribe(
      (response) => {
        // Handle successful response
        this.message = response.success
          ? 'Transfer successful!'
          : `Transfer failed: ${response.message}`;
      },
      (error) => {
        // Handle error response
        console.error('Error during transfer:', error);
        this.message = 'An error occurred during the transfer process';
      }
    );
  }
}
