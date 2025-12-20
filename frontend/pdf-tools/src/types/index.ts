export interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  hasBookmarks: boolean;
  isEncrypted: boolean;
  pageRange: string;
}

export interface MergeOptions {
  keepBookmarks: boolean;
  optimizeForPrint: boolean;
  usePageRange: boolean;
}

export interface MergeResult {
  blob: Blob;
  fileName: string;
  fileSize: string;
  pageCount: number;
}

export interface UseCaseOptions {
  optimizeForPrint: boolean;
  keepBookmarks: boolean;
  usePageRange: boolean;
}
