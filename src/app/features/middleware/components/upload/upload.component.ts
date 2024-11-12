import { Component } from '@angular/core';
import { MiddlewareService } from '../../services/middleware.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  customFileName: string = ''; // Custom name without spaces
  owner = 'kubicuser';
  currentPath = '/users/kubicuser';

  constructor(private middlewareService: MiddlewareService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    // Ensure no spaces in custom file name
    if (this.customFileName.includes(' ')) {
      alert('File name should not contain spaces.');
      return;
    }

    if (this.selectedFile) {
      const fileName = this.customFileName || this.selectedFile.name; // Use custom name if provided
      const file = new File([this.selectedFile], fileName); // Create a new File object with the custom name

      this.middlewareService.uploadFile(this.owner, this.currentPath, file).subscribe(response => {
        if (response.success) {
          alert('File uploaded successfully');
          this.selectedFile = null;
          this.customFileName = '';
        }
      });
    }
  }
}
