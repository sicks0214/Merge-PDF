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

export interface PluginConfig {
  name: string;
  slug: string;
  category: string;
  apiPath: string;
  order: number;
}

export interface PluginUI {
  [key: string]: any;
}

export interface PluginSchema {
  upload: {
    multiple: boolean;
    types: string[];
    maxSize: number;
    maxFiles: number;
  };
  options: Array<{
    name: string;
    type: string;
    default: any;
    label: { [lang: string]: string };
  }>;
  features: { [key: string]: boolean };
  output: {
    type: string;
    mimeType: string;
    filename: string;
  };
}

export interface PluginData {
  config: PluginConfig;
  ui: PluginUI;
  schema: PluginSchema;
}
