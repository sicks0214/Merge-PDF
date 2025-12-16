import { PDFFile } from '../types'

interface FilePreviewCardProps {
  file: PDFFile
  index: number
  onRemove: (id: string) => void
  thumbnailUrl?: string
}

export function FilePreviewCard({ file, index, onRemove, thumbnailUrl }: FilePreviewCardProps) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-44">
      {/* Thumbnail */}
      <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Plus badge between cards */}
      {index > 0 && (
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-light z-10">
          +
        </div>
      )}

      {/* File info */}
      <div className="p-3 text-center">
        <p className="text-sm text-blue-500 truncate font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {file.pageCount > 0 ? `${file.pageCount} pages` : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
