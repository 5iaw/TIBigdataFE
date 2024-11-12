import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file: File | null = null;
  uploadStatus: string = '';
  private backendUrl = 'http://localhost:10000';

  constructor(private http: HttpClient) {}
  ngOnInit(): void {

  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('path', window.location.pathname); // Current path as logical path
    formData.append('owner', 'user_id'); // Replace with actual user_id

    this.http.post(`${this.backendUrl}/upload`, formData).subscribe(
      () => {
        this.uploadStatus = 'File uploaded successfully!';
      },
      (error) => {
        this.uploadStatus = 'Failed to upload file';
        console.error('Error:', error);
      }
    );
  }
}
