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
  fileList: FileSystemEntity[] = [];
  owner = "kubicuser";
  currentPath = "/users/kubicuser";
  newFolderName: string = "";

  // Analysis-specific properties
  selectedAnalysisType: string = "";
  displayValue: number = 10;
  kValue: number = 3;
  w2vParam: number = 5;
  tfidfParam: number = 5;
  ldaParam: number = 5;
  optionList: number = 5;
  linkStrength: number = 50;
  nValue: number = 2;

  // Controls for dynamic fields
  showDisplayValue: boolean = false;
  showKValue: boolean = false;
  showW2VParam: boolean = false;
  showTFIDFParam: boolean = false;
  showLDAParam: boolean = false;
  showOptionList: boolean = false;
  showLinkStrength: boolean = false;
  showNValue: boolean = false;

  constructor(private middlewareService: MiddlewareService) {}

  ngOnInit(): void {
    this.loadFolderContents();
  }

  loadFolderContents(): void {
    this.middlewareService.getFileList(this.owner, this.currentPath).subscribe(
      (files) => (this.fileList = files),
      (error) => console.error("Error loading folder contents:", error),
    );
  }

  onAnalysisTypeChange(): void {
    // Reset all controls
    this.showDisplayValue =
      this.showKValue =
      this.showW2VParam =
      this.showTFIDFParam =
      this.showLDAParam =
      this.showOptionList =
      this.showLinkStrength =
      this.showNValue =
        false;

    // Display relevant controls based on selected analysis type
    switch (this.selectedAnalysisType) {
      case "wordcount":
        this.showDisplayValue = true;
        break;
      case "kmeans":
        this.showKValue = true;
        break;
      case "w2v":
        this.showW2VParam = true;
        break;
      case "tfidf":
        this.showTFIDFParam = true;
        break;
      case "lda":
        this.showLDAParam = true;
        break;
      case "sma":
        this.showOptionList = true;
        this.showLinkStrength = true;
        break;
      case "ngrams":
        this.showOptionList = true;
        this.showNValue = true;
        this.showLinkStrength = true;
        break;
    }
  }

  submitJob(): void {
    const selectedFileIds = this.getSelectedFiles();
    if (selectedFileIds.length === 0) {
      console.error("No files selected for analysis.");
      return;
    }

    const analysisParams: any = {
      owner: this.owner,
      input_file_ids: selectedFileIds,
    };

    // Assign parameters based on the analysis type
    switch (this.selectedAnalysisType) {
      case "wordcount":
        analysisParams.display_value = this.displayValue;
        break;
      case "kmeans":
        analysisParams.k_value = this.kValue;
        break;
      case "w2v":
        analysisParams.w2v_param = this.w2vParam;
        break;
      case "tfidf":
        analysisParams.tfidf_param = this.tfidfParam;
        break;
      case "lda":
        analysisParams.lda_param = this.ldaParam;
        break;
      case "sma":
        analysisParams.optionList = this.optionList;
        analysisParams.linkStrength = this.linkStrength;
        break;
      case "ngrams":
        analysisParams.optionList = this.optionList;
        analysisParams.n = this.nValue;
        analysisParams.linkStrength = this.linkStrength;
        break;
    }

    this.middlewareService
      .submitAnalysis(this.selectedAnalysisType, analysisParams)
      .subscribe(
        (response) =>
          response.success
            ? console.log(
                `${this.selectedAnalysisType} analysis job submitted successfully.`,
                response,
              )
            : console.error(
                `Failed to submit ${this.selectedAnalysisType} analysis job:`,
                response.message,
              ),
        (error) =>
          console.error(
            `Error submitting ${this.selectedAnalysisType} analysis job:`,
            error,
          ),
      );
  }

  getSelectedFiles(): string[] {
    return this.fileList
      .filter((file) => file.selected && file.type === "file")
      .map((file) => file.id);
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
