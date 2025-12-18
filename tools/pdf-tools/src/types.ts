export interface PDFFile {
  id: string
  file: File
  name: string
  pageCount: number
  hasBookmarks: boolean
  isEncrypted: boolean
  pageRange?: string  // e.g. "all", "1-5", "1,3,7-10"
}

export interface MergeCommand {
  fileIndex: number
  pageRange: string
}

export interface MergeOptions {
  keepBookmarks: boolean
  printMode: boolean
}

export interface ParsedCommands {
  commands: MergeCommand[]
  options: MergeOptions
  errors: string[]
}
