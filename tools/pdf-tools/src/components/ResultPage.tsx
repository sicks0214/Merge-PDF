import { downloadBlob } from '../api/merge'

interface MergeResult {
  blob: Blob
  fileName: string
  fileSize: string
  pageCount: number
}

interface ResultPageProps {
  result: MergeResult
  onReset: () => void
}

export function ResultPage({ result, onReset }: ResultPageProps) {
  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName)
  }

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Success icon and title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Done</h2>
      </div>

      {/* File info */}
      <p className="text-gray-600 mb-2">{result.fileName}</p>
      <p className="text-gray-400 text-sm mb-6">{result.fileSize} - {result.pageCount} pages</p>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="w-full py-3 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>

      {/* Merge Another File button */}
      <button
        onClick={onReset}
        className="w-full mt-3 py-3 px-6 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Merge Another File
      </button>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
        <button
          onClick={onReset}
          className="p-3 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
