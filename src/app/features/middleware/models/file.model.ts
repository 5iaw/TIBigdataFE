export interface FileMetadata {
    type: 'file' | 'folder';  // Type can be either 'file' or 'folder'
    name: string;             // Name of the file or folder
    path: string;             // Full path of the file or folder
    parent_path: string | null; // Path of the parent folder, null if it's the root folder
    owner: string;            // Owner of the file or folder
    created_at: Date;         // Creation date
    updated_at: Date;         // Last updated date
    size: number;             // Size of the file (0 for folders)
    hdfs_file_path?: string;  // HDFS path, only present for files
    permissions: Permissions; // Permissions for the file or folder
}

// Permissions structure for defining read, write, and share permissions
export interface Permissions {
    read: string[];           // List of users/groups with read access
    write: string[];          // List of users/groups with write access
    share: boolean;           // Whether the file or folder can be shared
}
