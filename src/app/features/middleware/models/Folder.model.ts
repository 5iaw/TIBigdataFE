// middleware/models/Folder.ts
import { FileSystemEntity } from './FileSystemEntity.model';

export class Folder extends FileSystemEntity {
    children: FileSystemEntity[] = [];

    constructor(data: Partial<Folder> = {}) {
        super(data);
        this.type = 'folder';
    }

    // Folder-specific methods
    addChild(entity: FileSystemEntity): void {
        this.children.push(entity);
    }

    listContents(): FileSystemEntity[] {
        return this.children;
    }
}
