import { useState, useCallback, DragEvent } from 'react'
import { PDFFile } from '../types'

interface CoreToolAreaProps {
  files: PDFFile[]
  onFilesAdded: (files: File[]) => void
  onRemoveFile: (id: string) => void
  onReorderFiles: (files: PDFFile[]) => void
  onMerge: () => void
  loading: boolean
  usePageRange: boolean
  onPageRangeChange?: (fileId: string, pageRange: string) => void
}

export function CoreToolArea({
  files,
  onFilesAdded,
  onRemoveFile,
  onReorderFiles,
  onMerge,
  loading,
  usePageRange,
  onPageRangeChange,
}: CoreToolAreaProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      onFilesAdded(fileArray)
    }
  }, [onFilesAdded])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files).filter(
        f => f.type === 'application/pdf'
      )
      if (fileArray.length > 0) {
        onFilesAdded(fileArray)
      }
    }
  }, [onFilesAdded])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }, [])

  // File list drag and drop for reordering
  const handleFileDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleFileDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    setDraggedIndex(index)
    onReorderFiles(newFiles)
  }

  const handleFileDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Area */}
      {files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDraggingOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
              Select PDF Files
            </span>
          </label>
          <p className="mt-4 text-gray-600">or drag and drop PDF files here</p>
          <p className="mt-2 text-sm text-gray-500">Upload multiple PDFs to merge them into one</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleFileDragStart(index)}
                onDragOver={(e) => handleFileDragOver(e, index)}
                onDragEnd={handleFileDragEnd}
                className={`flex items-center gap-4 p-4 cursor-move hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Drag handle */}
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>

                {/* File number */}
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.pageCount > 0 ? `${file.pageCount} pages` : 'Analyzing...'}
                    {file.hasBookmarks && ' • Has bookmarks'}
                    {file.isEncrypted && <span className="text-red-500"> • Encrypted</span>}
                  </p>
                </div>

                {/* Page range input (if enabled) */}
                {usePageRange && onPageRangeChange && (
                  <input
                    type="text"
                    placeholder="e.g. 1-5, all"
                    defaultValue="all"
                    onChange={(e) => onPageRangeChange(file.id, e.target.value)}
                    className="w-32 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Remove button */}
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add more files button */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <span className="text-gray-600 text-sm">+ Add more files</span>
            </div>
          </label>

          {/* Merge button */}
          <button
            onClick={onMerge}
            disabled={loading || files.length === 0}
            className="w-full py-4 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Merging...
              </>
            ) : (
              'Merge PDF'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
