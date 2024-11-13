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
  // Add this line to define displayValue with a default value (modify as needed)
  displayValue: number = 5; // Set a default value or leave undefined if input is optional

  constructor(private middlewareService: MiddlewareService) {}

  ngOnInit(): void {
    this.loadFolderContents();
  }

  // Load the contents of the current folder

  // Load the contents of the current folder
  loadFolderContents(): void {
    this.middlewareService.getFileList(this.owner, this.currentPath).subscribe(
      (files: FileSystemEntity[]) => {
        this.fileList = files;
        console.log("File list loaded:", this.fileList);
      },
      (error) => {
        console.error("Error loading folder contents:", error);
      },
    );
  }

  // Select files for analysis

  getSelectedFiles(): string[] {
    const selectedFiles = this.fileList
      .filter((file) => file.selected && file.type === "file")
      .map((file) => file.id); // Only pass the `id`

    console.log("Selected file IDs for analysis:", selectedFiles); // Log selected file IDs
    return selectedFiles;
  }

  submitAnalysis(type: string): void {
    const selectedFileIds = this.getSelectedFiles();

    if (selectedFileIds.length === 0) {
      console.error("No files selected for analysis.");
      return;
    }

    // Prepare analysisParams based on the analysis type
    let analysisParams: any = {
      owner: this.owner,
      input_file_ids: selectedFileIds,
    };
    switch (type) {
      case "wordcount":
        analysisParams.display_value = this.displayValue;
        break;
      case "kmeans":
        analysisParams.k_value = this.displayValue; // assuming displayValue is used for k_value
        break;
      case "w2v":
        analysisParams.w2v_param = this.displayValue;
        break;
      case "tfidf":
        analysisParams.tfidf_param = this.displayValue;
        break;
      case "lda":
        analysisParams.lda_param = this.displayValue;
        break;
      case "sma":
        analysisParams.optionList = "default_option";
        analysisParams.linkStrength = "default_strength";
        break;
      case "ngrams":
        analysisParams.optionList = "default_option";
        analysisParams.n = 5; // example n value
        analysisParams.linkStrength = "default_strength";
        break;
      default:
        console.error(`Unknown analysis type: ${type}`);
        return;
    }

    console.log("Submitting analysis job with parameters:", analysisParams);
    this.middlewareService.submitAnalysis(type, analysisParams).subscribe(
      (response) => {
        if (response.success) {
          console.log(`${type} analysis job submitted successfully.`, response);
        } else {
          console.error(
            `Failed to submit ${type} analysis job:`,
            response.message,
          );
        }
      },
      (error) => {
        console.error(`Error submitting ${type} analysis job:`, error);
      },
    );
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

  downloadFile(id: string, fileName: string): void {
    this.middlewareService.downloadFile(id).subscribe((response) => {
      const blob = new Blob([response], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }
  renameFile(file: FileSystemEntity): void {
    const newName = prompt("Enter the new name:", file.name);
    if (newName && newName !== file.name) {
      this.middlewareService.renameFileOrFolder(file.id, newName).subscribe(
        (response) => {
          if (response.success) {
            console.log("Renamed successfully.");
            this.loadFolderContents();
          } else {
            console.error("Failed to rename:", response.message);
          }
        },
        (error) => {
          console.error("Error renaming file or folder:", error);
        },
      );
    }
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
  // file-list.component.ts

  moveFile(file: FileSystemEntity): void {
    const newParentPath = prompt(
      "Enter the new folder path to move this item:",
      this.currentPath,
    );

    if (newParentPath && newParentPath !== file.parentPath) {
      this.middlewareService
        .moveFileOrFolder(file.id, this.owner, newParentPath)
        .subscribe(
          (response) => {
            if (response.success) {
              console.log("File or folder moved successfully.");
              this.loadFolderContents(); // Reload folder contents to reflect the move
            } else {
              console.error("Failed to move file or folder:", response.message);
            }
          },
          (error) => {
            console.error("Error moving file or folder:", error);
          },
        );
    } else {
      console.log("Move cancelled or invalid path entered.");
    }
  }
}
