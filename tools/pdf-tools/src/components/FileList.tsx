import { PDFFile } from '../types'

interface FileListProps {
  files: PDFFile[]
  onRemove: (id: string) => void
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
      {files.map((file, index) => (
        <div key={file.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400 w-6">{index + 1}.</span>
            <div>
              <span className="text-sm text-gray-700">{file.name}</span>
              <span className="ml-2 text-xs text-gray-400">
                {file.pageCount > 0 ? `(${file.pageCount}页${file.hasBookmarks ? ', 书签' : ''})` : ''}
                {file.isEncrypted && <span className="text-red-500 ml-1">加密</span>}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(file.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
