// src/app/features/middleware/services/middleware.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileMetadata } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class MiddlewareService {
  private apiUrl = 'http://localhost:10000';  // Flask backend base URL

  constructor(private http: HttpClient) {}

  uploadFile(owner: string, path: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('owner', owner);
    formData.append('path', path);
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  listFilesInFolder(owner: string, folderPath: string): Observable<{ success: boolean, files: FileMetadata[] }> {
    const params = new HttpParams().set('owner', owner).set('folder_path', folderPath);
    return this.http.get<{ success: boolean, files: FileMetadata[] }>(`${this.apiUrl}/list`, { params });
  }

  deleteFile(path: string): Observable<any> {
    const params = new HttpParams().set('path', path);
    return this.http.delete(`${this.apiUrl}/delete`, { params });
  }

  downloadFile(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.apiUrl}/download`, { params, responseType: 'blob' });
  }

  transferEsDataToStorage(esId: string, owner: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams().set('es_id', esId).set('owner', owner);
    return this.http.post(`${this.apiUrl}/transfer`, body.toString(), { headers });
  }

  viewUserFolder(owner: string, folderPath: string): Observable<{ success: boolean, contents: FileMetadata[] }> {
    const params = new HttpParams().set('owner', owner).set('folder_path', folderPath);
    return this.http.get<{ success: boolean, contents: FileMetadata[] }>(`${this.apiUrl}/user/folder`, { params });
  }

  // Get job status
  getJobStatus(jobId: number): Observable<{ state: string }> {
    return this.http.get<{ state: string }>(`${this.apiUrl}/spark/status/${jobId}`);
  }

  // Fetch analysis result
  getAnalysisResult(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/spark/analysis/${path}`);
  }
}
