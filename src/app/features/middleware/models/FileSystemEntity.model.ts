// middleware/models/FileSystemEntity.ts
export class FileSystemEntity {
    name: string;
    path: string;
    parentPath: string | null;
    owner: string;
    createdAt: Date;
    updatedAt: Date;
    type: 'file' | 'folder';

    constructor(data: Partial<FileSystemEntity> = {}) {
        this.name = data.name || '';
        this.path = data.path || '';
        this.parentPath = data.parentPath || null;
        this.owner = data.owner || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.type = data.type || 'file';
    }
}
