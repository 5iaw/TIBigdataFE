import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: any[] = [];
  private apiUrl = 'http://localhost:10000/mongo/file/list';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFiles();
  }

  getFiles(): void {
    this.http.get<any[]>(`${this.apiUrl}`).subscribe(
      response => {
        this.files = response;
      },
      error => {
        console.error('Error fetching file list:', error);
      }
    );
  }
}
