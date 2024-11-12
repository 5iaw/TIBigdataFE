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
  private baseUrl = "http://localhost:10000/file";

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
            return response.contents.map(
              (item) =>
                new FileSystemEntity({
                  id: item.id,
                  name: item.name,
                  path: item.path,
                  parentPath: item.parent_path,
                  owner: owner,
                  createdAt: new Date(item.created_at),
                  updatedAt: new Date(item.updated_at),
                  type: item.type,
                }),
            );
          }
          return []; // Return empty array if no contents
        }),
        catchError((error) => {
          console.error("Error loading folder contents:", error);
          return of([]); // Return empty array on error
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

  deleteFileOrFolderById(id: string): Observable<any> {
    const params = new HttpParams().set("id", id);
    return this.http.delete(`${this.baseUrl}/delete`, { params });
  }

  // Download a file
  downloadFile(path: string): Observable<Blob> {
    const params = new HttpParams().set("path", path);
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
}
