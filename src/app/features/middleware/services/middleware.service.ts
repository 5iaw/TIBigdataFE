// middleware.service.ts

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { FileSystemEntity } from "../models/FileSystemEntity.model";

@Injectable({
  providedIn: "root",
})
export class MiddlewareService {

  // private baseUrl = "http://localhost:10000/file";
  // private analysis_url = "http://localhost:10000/input_livy";
  // Backend API endpoints
  private baseUrl = "https://kubic.handong.edu:15051/file";
  private analysis_url = "https://kubic.handong.edu:15051/input_livy";

  constructor(private http: HttpClient) {}

  // Get files and folders in a specific path
  getFileList(owner: string, folderPath: string): Observable<FileSystemEntity[]> {
    const params = new HttpParams()
      .set("owner", owner)
      .set("folder_path", folderPath);

    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http
      .get<{
        success: boolean;
        contents: any[];
      }>(`${this.baseUrl}/user/folder`, {
        params,
        headers,
        withCredentials: true, // Enable credentials for CORS
      })
      .pipe(
        map((response) => {
          if (response.success && response.contents) {
            console.log("Received folder contents from backend:", response.contents);
            return response.contents.map(
              (item) =>
                new FileSystemEntity({
                  id: item.id,
                  name: item.name,
                  path: item.path,
                  parentPath: item.parent_path,
                  hdfsFilePath: item.hdfs_file_path,
                  owner: owner,
                  createdAt: new Date(item.created_at),
                  updatedAt: new Date(item.updated_at),
                  type: item.type,
                  is_analysis_result: item.is_analysis_result || false,
                  analysis_result_type: item.analysis_result_type || null,
                })
            );
          }
          return [];
        }),
        catchError((error) => {
          console.error("Error loading folder contents:", error);
          return of([]);
        })
      );
  }

  // Upload a file with a custom name
  uploadFile(owner: string, path: string, file: File, customFileName: string): Observable<any> {
    const formData = new FormData();
    formData.append("owner", owner);
    formData.append("path", path);
    formData.append("file", file, customFileName);

    const headers = new HttpHeaders(); // No 'Content-Type' header for FormData

    return this.http.post(`${this.baseUrl}/upload`, formData, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Submit an analysis job dynamically by type
  submitAnalysis(type: string, params: any): Observable<any> {
    console.log(`Sending ${type} analysis job to server with params:`, params);
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.post(`${this.analysis_url}/submit_${type}`, params, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    }).pipe(
      map((response) => {
        console.log(`${type} analysis server response:`, response);
        return response;
      }),
      catchError((error) => {
        console.error(`${type} analysis server error:`, error);
        return of({
          success: false,
          message: "Failed to submit analysis job.",
        });
      })
    );
  }

  // Delete a file or folder by ID
  deleteFileOrFolderById(id: string): Observable<any> {
    const params = new HttpParams().set("id", id);
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.delete(`${this.baseUrl}/delete`, {
      params,
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Download a file
  downloadFile(id: string): Observable<Blob> {
    const params = new HttpParams().set("id", id);
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.get(`${this.baseUrl}/download`, {
      params,
      headers,
      responseType: "blob",
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Create a new folder
  createFolder(owner: string, path: string, folderName: string): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.post(`${this.baseUrl}/folder/create`, {
      owner: owner,
      path: path,
      folder_name: folderName,
    }, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Rename a file or folder
  renameFileOrFolder(id: string, newName: string): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.post(`${this.baseUrl}/rename`, {
      id: id,
      new_name: newName,
    }, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Move a file or folder
  moveFileOrFolder(id: string, owner: string, newParentPath: string): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.put(`${this.baseUrl}/move`, {
      id: id,
      owner: owner,
      new_parent_path: newParentPath,
    }, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  // Get the result of an analysis
  getAnalysisResult(params: HttpParams): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this.http.get(`${this.analysis_url}/analysis`, {
      params,
      headers,
      withCredentials: true, // Enable credentials for CORS
    }).pipe(
      map((response) => {
        console.log("Analysis result fetched successfully:", response);
        return { success: true, file_content: response };
      }),
      catchError((error) => {
        console.error("Failed to fetch analysis result:", error);
        return of({
          success: false,
          message: "Error fetching analysis result.",
        });
      })
    );
  }
}
