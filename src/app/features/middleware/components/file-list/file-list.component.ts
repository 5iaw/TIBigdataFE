import { Component, OnInit } from '@angular/core';
import { FileSystemEntity } from '../../models/FileSystemEntity.model';
import { MiddlewareService } from '../../services/middleware.service';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: FileSystemEntity[] = [];
  owner = 'kubicuser';
  currentPath = '/users/kubicuser';

  constructor(private middlewareService: MiddlewareService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.middlewareService.getFileList(this.owner, this.currentPath).subscribe(response => {
      if (response.success) {
        this.files = response.contents;
      }
    });
  }

  navigateToFolder(folder: FileSystemEntity): void {
    if (folder.type === 'folder') {
      this.currentPath = folder.path;
      this.loadFiles();
    }
  }

  deleteFile(file: FileSystemEntity): void {
    this.middlewareService.deleteFile(file.path).subscribe(response => {
      if (response.success) {
        this.loadFiles();
      }
    });
  }

  downloadFile(filePath: string, fileName: string): void {
    this.middlewareService.downloadFile(filePath).subscribe(response => {
      const blob = new Blob([response], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
