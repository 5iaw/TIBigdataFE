// file-list.component.ts
import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { UserProfile } from "src/app/core/models/user.model";
import { AnalysisOnMiddlewareService } from "src/app/core/services/analysis-on-middleware-service/analysis.on.middleware.service";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";
import { IpService } from "src/app/core/services/ip-service/ip.service";
import { FileSystemEntity } from "src/app/features/middleware/models/FileSystemEntity.model";

interface ErrorResponse {
  success: false;
  message: string;
}

function encodeEmail(email: string): string {
  return btoa(email).replace(/=/g, "");
}
@Component({
  selector: "app-file-list",
  templateUrl: "./file-list.component.html",
  styleUrls: ["./file-list.component.less"],
})
export class FileListComponent implements OnInit {
  fileList: FileSystemEntity[] = [];
  owner = "";
  currentPath = "";
  newFolderName: string = "";

  selectedFiles: FileSystemEntity[] = []; // Array to store selected files
  // Controls for dynamic fields
  showDisplayValue: boolean = false;
  showKValue: boolean = false;
  showW2VParam: boolean = false;
  showTFIDFParam: boolean = false;
  showLDAParam: boolean = false;
  showOptionList: boolean = false;
  showLinkStrength: boolean = false;
  showNValue: boolean = false;
  showNERParam: boolean = false;
  currentUser: UserProfile;

  // File upload properties
  selectedFile: File | null = null;
  customFileName: string = "";

  output_path: string;
  analysisedData: any;
  activity: string;
  selectedAnalysisData: any = null;
  selectedAnalysisFileName: string = "";

  private middlewareUrl = this.ipService.getMiddlewareServerIp() + "/spark";
  constructor(
    private ipService: IpService,
    private authService: AuthenticationService,
    private middlewareService: AnalysisOnMiddlewareService,
    private http: HttpClient,
  ) {
    console.log("FileListComponent constructor called.");
    this.authService.getCurrentUserChange().subscribe((user) => {
      console.log("User fetched:", user);
      this.currentUser = user;
      this.owner = encodeEmail(this.currentUser.email); // Encode email only once and set as owner
      console.log("Owner set to:", this.owner);
      this.currentPath = `/users/${this.owner}`; // Set initial path
      console.log("Initial path set to:", this.currentPath);
    });
  }

  ngOnInit(): void {
    console.log("FileListComponent ngOnInit called.");
    this.loadFolderContents();
  }
  @Output() selectedFilesChange = new EventEmitter<FileSystemEntity[]>();

  updateSelectedFiles(): void {
    const selectedFiles = this.fileList.filter((file) => file.selected);
    console.log("Selected files updated:", selectedFiles); // Debug log
    this.selectedFilesChange.emit(selectedFiles);
  }

  loadFolderContents(): void {
    console.log("Loading folder contents for path:", this.currentPath);
    this.middlewareService.getFileList(this.owner, this.currentPath).subscribe(
      (files) => {
        console.log("Files loaded successfully:", files);
        this.fileList = files;
      },
      (error) => {
        console.error("Error loading folder contents:", error);
      },
    );
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.customFileName = this.selectedFile.name.split(".")[0];
      this.updateSelectedFiles(); // Emit the updated selection
    }
  }
  toggleFileSelection(file: FileSystemEntity): void {
    if (file.selected) {
      // Add the file to the selectedFiles array if selected
      if (!this.selectedFiles.includes(file)) {
        this.selectedFiles.push(file);
      }
    } else {
      // Remove the file from the selectedFiles array if unselected
      this.selectedFiles = this.selectedFiles.filter((f) => f.id !== file.id);
    }
    this.updateSelectedFiles(); // Emit the updated selection
  }

  // onFileSelected(event: Event): void {
  //   console.log("File selected event triggered:", event);
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //     this.customFileName = this.selectedFile.name.split(".")[0]; // Set default name without extension
  //     console.log("Selected file:", this.selectedFile);
  //     console.log("Custom file name set to:", this.customFileName);
  //   }
  // }

  uploadFile(): void {
    if (this.selectedFile && this.currentPath) {
      const fileName =
        this.customFileName.trim().replace(/\s+/g, "_") +
        this.getFileExtension(this.selectedFile.name);
      console.log("Uploading file with name:", fileName);
      this.middlewareService
        .uploadFile(this.owner, this.currentPath, this.selectedFile, fileName)
        .subscribe(
          (response) => {
            console.log("File uploaded successfully:", response);
            this.loadFolderContents();
          },
          (error) => {
            console.error("Error uploading file:", error);
          },
        );
    } else {
      console.error("No file selected or upload path missing");
    }
  }

  private getFileExtension(fileName: string): string {
    const index = fileName.lastIndexOf(".");
    return index !== -1 ? fileName.substring(index) : ""; // Get file extension if present
  }

  getSelectedFiles(): string[] {
    return this.fileList
      .filter((file) => file.selected && file.type === "file")
      .map((file) => file.id);
  }

  navigateUp(): void {
    if (this.currentPath !== `/users/${this.owner}`) {
      const lastSlashIndex = this.currentPath.lastIndexOf("/");
      const previousPath =
        this.currentPath.substring(0, lastSlashIndex) || `/users/${this.owner}`;
      console.log("Navigating up from:", this.currentPath, "to:", previousPath);
      this.currentPath = previousPath;
      this.loadFolderContents();
    }
  }

  navigateToFolder(folder: FileSystemEntity): void {
    if (folder.type === "folder") {
      console.log(
        "Navigating to folder:",
        folder.name,
        "at path:",
        folder.path,
      );
      this.currentPath = folder.path;
      this.loadFolderContents();
    } else {
      console.error("Attempted to navigate to a non-folder entity:", folder);
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
              this.loadFolderContents();
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
