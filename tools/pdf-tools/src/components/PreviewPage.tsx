import { PDFFile } from '../types'
import { FilePreviewCard } from './FilePreviewCard'
import { AddFileCard } from './AddFileCard'

interface PreviewPageProps {
  files: PDFFile[]
  thumbnails: Map<string, string>
  onRemove: (id: string) => void
  onFilesAdded: (files: FileList) => void
  onMerge: () => void
  loading: boolean
  error: string | null
}

export function PreviewPage({
  files,
  thumbnails,
  onRemove,
  onFilesAdded,
  onMerge,
  loading,
  error
}: PreviewPageProps) {
  return (
    <div className="flex flex-col items-center">
      {/* File cards container */}
      <div className="flex items-start gap-6 overflow-x-auto pb-4 px-4 max-w-full">
        {files.map((file, index) => (
          <FilePreviewCard
            key={file.id}
            file={file}
            index={index}
            onRemove={onRemove}
            thumbnailUrl={thumbnails.get(file.id)}
          />
        ))}
        <AddFileCard onFilesAdded={onFilesAdded} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg max-w-md text-center">
          {error}
        </div>
      )}

      {/* Merge button */}
      <button
        onClick={onMerge}
        disabled={loading || files.length === 0}
        className="mt-8 px-12 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Merging...
          </span>
        ) : (
          'Merge PDF'
        )}
      </button>
    </div>
  )
}
