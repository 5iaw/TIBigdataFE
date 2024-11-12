import { FileSystemEntity } from './FileSystemEntity.model';

export class File extends FileSystemEntity {
    size: number;
    hdfsFilePath?: string;

    constructor(data: Partial<File> = {}) {
        super(data);
        this.size = data.size || 0;
        this.hdfsFilePath = data.hdfsFilePath || '';
        this.type = 'file';
    }

    // File-specific methods
    download(): void {
        console.log(`Downloading file: ${this.name}`);
    }
}
