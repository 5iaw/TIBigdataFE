// file-list.component.ts

import { Component, OnInit } from "@angular/core";
import { FileSystemEntity } from "../../models/FileSystemEntity.model";
import { MiddlewareService } from "../../services/middleware.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
interface SuccessResponse {
  success: true;
  contents: FileSystemEntity[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

type FolderContentsResponse = SuccessResponse | ErrorResponse;

@Component({
  selector: "app-file-list",
  templateUrl: "./file-list.component.html",
  styleUrls: ["./file-list.component.css"],
})
export class FileListComponent implements OnInit {
  files: FileSystemEntity[] = [];
  owner = "kubicuser";
  currentPath = "/users/kubicuser";
  fileList: FileSystemEntity[] = [];
  newFolderName: string = "";

  constructor(private middlewareService: MiddlewareService) {}

  ngOnInit(): void {
    this.loadFolderContents();
  }

  // Load the contents of the current folder

  loadFolderContents(): void {
    this.middlewareService.getFileList(this.owner, this.currentPath).subscribe(
      (files: FileSystemEntity[]) => {
        this.fileList = files;
        console.log("File list loaded:", this.fileList); // Log file list to debug
      },
      (error) => {
        console.error("Error loading folder contents:", error);
      },
    );
  }

  navigateToFolder(folder: FileSystemEntity): void {
    if (folder.type === "folder") {
      this.currentPath = folder.path;
      this.loadFolderContents();
    }
  }

  navigateUp(): void {
    if (this.currentPath !== "/users/kubicuser") {
      const lastSlashIndex = this.currentPath.lastIndexOf("/");
      this.currentPath =
        this.currentPath.substring(0, lastSlashIndex) || "/users/kubicuser";
      this.loadFolderContents();
    }
  }

  deleteFile(file: FileSystemEntity): void {
    if (!file.id) {
      console.error("File ID is missing.");
      return;
    }
    this.middlewareService
      .deleteFileOrFolderById(file.id)
      .subscribe((response) => {
        if (response.success) {
          this.loadFolderContents();
        } else {
          console.error("Failed to delete file:", response.message);
        }
      });
  }

  downloadFile(filePath: string, fileName: string): void {
    this.middlewareService.downloadFile(filePath).subscribe((response) => {
      const blob = new Blob([response], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }

  createNewFolder(): void {
    if (this.newFolderName.trim()) {
      this.middlewareService
        .createFolder(this.owner, this.currentPath, this.newFolderName)
        .subscribe(
          (response) => {
            if (response.success) {
              console.log("Folder created successfully");
              this.loadFolderContents();
              this.newFolderName = "";
            } else {
              console.error(
                "Failed to create folder:",
                (response as ErrorResponse).message,
              );
            }
          },
          (error) => {
            console.error("Error creating folder:", error);
          },
        );
    } else {
      console.error("Folder name cannot be empty or contain only spaces");
    }
  }
}
