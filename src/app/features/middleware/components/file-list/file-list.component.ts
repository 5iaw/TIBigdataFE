import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: any[] = [];
  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:10000/file/list';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFiles();
  }

  getFiles(): void {
    this.http.get<any>(`${this.apiUrl}?owner=kubicuser&folder_path=/users/kubicuser`).subscribe(
      response => {
        if (response.success) {
          this.files = response.files;
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message || 'Could not retrieve file list';
        }
      },
      error => {
        this.errorMessage = `Error fetching file list: ${error.message}`;
        console.error('Error details:', error);
      }
    );
  }
}
