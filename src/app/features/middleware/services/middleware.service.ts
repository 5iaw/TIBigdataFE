import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileSystemEntity } from '../models/FileSystemEntity.model';

@Injectable({
  providedIn: 'root'
})
export class MiddlewareService {
  private baseUrl = 'http://localhost:10000/file';

  constructor(private http: HttpClient) {}

  // Get files and folders in a specific path
  getFileList(owner: string, folderPath: string): Observable<{ success: boolean; contents: FileSystemEntity[] }> {
    const params = new HttpParams().set('owner', owner).set('folder_path', folderPath);
    return this.http.get<{ success: boolean; contents: FileSystemEntity[] }>(`${this.baseUrl}/user/folder`, { params });
  }

  // Upload a file
  uploadFile(owner: string, path: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('owner', owner);
    formData.append('path', path);
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  // Delete a file
  deleteFile(path: string): Observable<any> {
    const params = new HttpParams().set('path', path);
    return this.http.delete(`${this.baseUrl}/delete`, { params });
  }
    // Download a file
  downloadFile(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.baseUrl}/download`, { params, responseType: 'blob' });
  }

  // Create a new folder
  createFolder(owner: string, path: string, folderName: string): Observable<any> {
    const body = {
      owner: owner,
      path: path,
      folder_name: folderName
    };
    return this.http.post(`${this.baseUrl}/folder/create`, body);
  }
}
