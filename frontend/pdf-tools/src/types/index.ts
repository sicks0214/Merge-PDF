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
  [key: string]: any;
}

export interface MergeResult {
  blob: Blob;
  fileName: string;
  fileSize: string;
  pageCount: number;
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

export interface PluginSchemaOption {
  name: string;
  type: 'boolean' | 'number' | 'text' | 'select' | 'checkbox';
  default?: any;
  useCaseKey?: string;
  label: { [lang: string]: string };
  choices?: Array<{
    value: string;
    label: { [lang: string]: string };
  }>;
  min?: number;
  max?: number;
  placeholder?: { [lang: string]: string };
}

export interface PluginSchema {
  upload: {
    multiple: boolean;
    types: string[];
    maxSize: number;
    maxFiles: number;
  };
  options: PluginSchemaOption[];
  features?: { [key: string]: boolean };
  output?: {
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

export interface PluginListItem {
  name: string;
  slug: string;
  category: string;
  apiPath: string;
  order: number;
  ui: PluginUI;
}
