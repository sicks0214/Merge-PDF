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
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
    >
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleInputChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {existingCount === 0 ? (
            <span>拖拽或点击上传 PDF</span>
          ) : (
            <span>继续添加 PDF 文件</span>
          )}
        </div>
      </label>
    </div>
  )
}
