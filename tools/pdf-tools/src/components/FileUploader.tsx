import { useCallback } from 'react'
import { PDFFile } from '../types'

interface FileUploaderProps {
  onFilesAdded: (files: PDFFile[]) => void
  existingCount: number
}

export function FileUploader({ onFilesAdded, existingCount }: FileUploaderProps) {
  const handleFiles = useCallback(async (fileList: FileList) => {
    const pdfFiles: PDFFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (file.type !== 'application/pdf') continue

      pdfFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        pageCount: 0,
        hasBookmarks: false,
        isEncrypted: false,
      })
    }

    if (pdfFiles.length > 0) {
      onFilesAdded(pdfFiles)
    }
  }, [onFilesAdded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col items-center justify-center py-8"
    >
      {/* Cloud upload icon */}
      <div className="mb-6">
        <svg className="w-16 h-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      {/* Select files button */}
      <label className="cursor-pointer mb-4">
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <span className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {existingCount === 0 ? 'Select files' : 'Add more files'}
        </span>
      </label>

      {/* Description text */}
      <p className="text-gray-600 mb-3">
        Add <span className="font-semibold">PDF</span>, <span className="font-semibold">image</span>, <span className="font-semibold">Word</span>, <span className="font-semibold">Excel</span>, and <span className="font-semibold">PowerPoint</span> files
      </p>

      {/* Supported formats */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Supported formats:</span>
        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">PDF</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-medium">DOC</span>
        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium">XLS</span>
        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-medium">PPT</span>
        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-medium">PNG</span>
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded text-xs font-medium">JPG</span>
      </div>
    </div>
  )
}
