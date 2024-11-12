// src/app/features/middleware/services/middleware.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiddlewareService {
  private baseUrl = 'http://localhost:10000';  // Flask backend base URL

  constructor(private http: HttpClient) {}

  uploadFile(owner: string, path: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('owner', owner);
    formData.append('path', path);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/file/upload`, formData);
  }

  deleteFile(path: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/file/delete`, { params: { path } });
  }

  listFiles(owner: string, folderPath: string = '/'): Observable<any> {
    return this.http.get(`${this.baseUrl}/file/list`, {
      params: { owner, folder_path: folderPath },
    });
  }

  updateFile(path: string, updateData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/file/update`, {
      path,
      update_data: updateData,
    });
  }

  downloadFile(path: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/download`, {
      params: { path },
      responseType: 'blob', // For file download
    });
  }

  transferEsToHdfs(owner: string, esId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfer`, {
      owner,
      es_id: esId,
    });
  }

  // Get job status
  getJobStatus(jobId: number): Observable<{ state: string }> {
    return this.http.get<{ state: string }>(`${this.baseUrl}/spark/status/${jobId}`);
  }

  // Fetch analysis result
  getAnalysisResult(path: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/spark/analysis/${path}`);
  }
}
