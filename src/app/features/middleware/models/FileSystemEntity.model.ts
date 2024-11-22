export class FileSystemEntity {
  id: string;
  name: string;
  path: string;
  parentPath: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  type: "file" | "folder";
  is_analysis_result: boolean = false;
  analysis_result_type?: string;
  hdfsFilePath?: string; // Add this property
  selected: boolean = false; // Add this property

  constructor(data: Partial<FileSystemEntity> = {}) {
    this.id = data.id || "";
    this.name = data.name || "";
    this.path = data.path || "";
    this.parentPath = data.parentPath || null;
    this.owner = data.owner || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.type = data.type || "file";
    this.is_analysis_result = data.is_analysis_result || false;
    this.analysis_result_type = data.analysis_result_type || null;
    this.hdfsFilePath = data.hdfsFilePath || null; // Initialize
    this.selected = data.selected || false; // Initialize
  }
}
