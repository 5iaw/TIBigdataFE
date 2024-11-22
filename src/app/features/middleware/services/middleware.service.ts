// middleware.service.ts

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { FileSystemEntity } from "../models/FileSystemEntity.model";

interface SuccessResponse {
  success: true;
  contents: FileSystemEntity[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class MiddlewareService {
  // private baseUrl = "http://localhost:10000/file";
  // private analysis_url = "http://localhost:10000/input_livy";

  private baseUrl = "https://203.252.112.15:10000/file";
  private analysis_url = "https://203.252.112.15:10000/input_livy";
  constructor(private http: HttpClient) {}

  // Get files and folders in a specific path
  getFileList(
    owner: string,
    folderPath: string,
  ): Observable<FileSystemEntity[]> {
    const params = new HttpParams()
      .set("owner", owner)
      .set("folder_path", folderPath);

    return this.http
      .get<{
        success: boolean;
        contents: any[];
      }>(`${this.baseUrl}/user/folder`, { params })
      .pipe(
        map((response) => {
          if (response.success && response.contents) {
            console.log(
              "Received folder contents from backend:",
              response.contents,
            ); // Debug log
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
                }),
            );
          }
          return [];
        }),
        catchError((error) => {
          console.error("Error loading folder contents:", error);
          return of([]);
        }),
      );
  }

  // Upload a file with a custom name
  uploadFile(
    owner: string,
    path: string,
    file: File,
    customFileName: string,
  ): Observable<any> {
    const formData = new FormData();
    formData.append("owner", owner);
    formData.append("path", path);
    formData.append("file", file, customFileName);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  // Method to submit analysis jobs
  // Method to submit analysis jobs dynamically by type
  submitAnalysis(type: string, params: any): Observable<any> {
    console.log(`Sending ${type} analysis job to server with params:`, params);
    return this.http.post(`${this.analysis_url}/submit_${type}`, params).pipe(
      map((response) => {
        console.log(`${type} analysis server response:`, response); // Log response
        return response;
      }),
      catchError((error) => {
        console.error(`${type} analysis server error:`, error); // Log error if it occurs
        return of({
          success: false,
          message: "Failed to submit analysis job.",
        });
      }),
    );
  }
  submitAnalysisJob(params: any): Observable<any> {
    return this.http.post(`${this.analysis_url}/submit_wordcount`, params);
  }
  deleteFileOrFolderById(id: string): Observable<any> {
    const params = new HttpParams().set("id", id);
    return this.http.delete(`${this.baseUrl}/delete`, { params });
  }

  // Download a file
  downloadFile(id: string): Observable<Blob> {
    const params = new HttpParams().set("id", id);
    return this.http.get(`${this.baseUrl}/download`, {
      params,
      responseType: "blob",
    });
  }

  // Create a new folder
  createFolder(
    owner: string,
    path: string,
    folderName: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/folder/create`, {
      owner: owner,
      path: path,
      folder_name: folderName,
    });
  }
  renameFileOrFolder(id: string, newName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/rename`, {
      id: id,
      new_name: newName,
    });
  }
  moveFileOrFolder(
    id: string,
    owner: string,
    newParentPath: string,
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/move`, {
      id: id,
      owner: owner,
      new_parent_path: newParentPath,
    });
  }
  getAnalysisResult(params: HttpParams): Observable<any> {
    return this.http.get(`${this.analysis_url}/analysis`, { params }).pipe(
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
      }),
    );
  }
}
