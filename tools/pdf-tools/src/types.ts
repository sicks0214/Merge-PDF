export interface PDFFile {
  id: string
  file: File
  name: string
  pageCount: number
  hasBookmarks: boolean
  isEncrypted: boolean
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
