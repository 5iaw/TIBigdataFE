// upload.component.ts
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MiddlewareService } from "../../services/middleware.service";

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.css"],
})
export class UploadComponent {
  @Input() currentPath: string = ""; // The path to upload the file to
  @Output() uploadSuccess = new EventEmitter<void>();
  selectedFile: File | null = null;
  customFileName: string = ""; // The custom name chosen by the user

  constructor(private middlewareService: MiddlewareService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.customFileName = this.selectedFile.name.split(".")[0]; // Default name (without extension)
    }
  }

  uploadFile(): void {
    if (this.selectedFile && this.currentPath) {
      // Remove spaces from the custom name and append the original file extension
      const fileName =
        this.customFileName.trim().replace(/\s+/g, "_") +
        this.getFileExtension(this.selectedFile.name);
      this.middlewareService
        .uploadFile("kubicuser", this.currentPath, this.selectedFile, fileName)
        .subscribe(
          (response) => {
            console.log("File uploaded successfully");
            this.uploadSuccess.emit(); // Emit event on success
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
}
