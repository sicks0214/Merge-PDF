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
    <div className="mx-auto">
      {/* Upload Area */}
      {files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
            isDraggingOver
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02]'
              : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400'
          }`}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                Select PDF Files
              </span>
            </label>
            <p className="mt-6 text-lg text-gray-700 font-medium">or drag and drop PDF files here</p>
            <p className="mt-2 text-sm text-gray-500">Upload multiple PDFs to merge them into one document</p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 divide-y divide-gray-200 overflow-hidden shadow-sm">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleFileDragStart(index)}
                onDragOver={(e) => handleFileDragOver(e, index)}
                onDragEnd={handleFileDragEnd}
                className={`flex items-center gap-4 p-5 cursor-move hover:bg-white transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Drag handle */}
                <svg className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>

                {/* File number */}
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </span>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">
                      {file.pageCount > 0 ? `${file.pageCount} pages` : 'Analyzing...'}
                    </p>
                    {file.hasBookmarks && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Bookmarks</span>
                    )}
                    {file.isEncrypted && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Encrypted</span>
                    )}
                  </div>
                </div>

                {/* Page range input (if enabled) */}
                {usePageRange && onPageRangeChange && (
                  <input
                    type="text"
                    placeholder="e.g. 1-5, all"
                    defaultValue="all"
                    onChange={(e) => onPageRangeChange(file.id, e.target.value)}
                    className="w-32 px-4 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Remove button */}
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Remove file"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
              <span className="text-gray-600 font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add more files
              </span>
            </div>
          </label>

          {/* Merge button */}
          <button
            onClick={onMerge}
            disabled={loading || files.length === 0}
            className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                Merging PDF Files...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Merge PDF Files
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
