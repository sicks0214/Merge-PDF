import { useState, useCallback, useEffect } from 'react'
import { FileUploader } from './components/FileUploader'
import { PreviewPage } from './components/PreviewPage'
import { ResultPage } from './components/ResultPage'
import { PDFFile } from './types'
import { mergePDFs, analyzePDF } from './api/merge'

type PageState = 'upload' | 'preview' | 'result'

interface MergeResult {
  blob: Blob
  fileName: string
  fileSize: string
  pageCount: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function App() {
  const [pageState, setPageState] = useState<PageState>('upload')
  const [files, setFiles] = useState<PDFFile[]>([])
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null)

  // Generate thumbnail for PDF file
  const generateThumbnail = useCallback(async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          resolve(null)
        } catch {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const handleFilesAdded = useCallback(async (newFiles: PDFFile[] | FileList) => {
    let pdfFiles: PDFFile[] = []

    if (newFiles instanceof FileList) {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
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
    } else {
      pdfFiles = newFiles
    }

    if (pdfFiles.length === 0) return

    const analyzedFiles = await Promise.all(
      pdfFiles.map(async (pdfFile) => {
        try {
          const info = await analyzePDF(pdfFile.file)
          return { ...pdfFile, ...info }
        } catch {
          return pdfFile
        }
      })
    )

    for (const pdfFile of analyzedFiles) {
      const thumbnail = await generateThumbnail(pdfFile.file)
      if (thumbnail) {
        setThumbnails(prev => new Map(prev).set(pdfFile.id, thumbnail))
      }
    }

    setFiles(prev => [...prev, ...analyzedFiles])
    setError(null)

    if (pageState === 'upload') {
      setPageState('preview')
    }
  }, [pageState, generateThumbnail])

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id)
      if (newFiles.length === 0) {
        setPageState('upload')
      }
      return newFiles
    })
    setThumbnails(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])

  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      setError('Please upload PDF files first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const commands = files.map((_, i) => `${i + 1}:all`).join('\n')
      const blob = await mergePDFs(files, commands)

      const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0)

      const baseName = files[0].name.replace('.pdf', '')
      const fileName = `${baseName}-merged.pdf`

      setMergeResult({
        blob,
        fileName,
        fileSize: formatFileSize(blob.size),
        pageCount: totalPages
      })

      setPageState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed')
    } finally {
      setLoading(false)
    }
  }, [files])

  const handleReset = useCallback(() => {
    setFiles([])
    setThumbnails(new Map())
    setMergeResult(null)
    setError(null)
    setPageState('upload')
  }, [])

  useEffect(() => {
    return () => {
      thumbnails.forEach(url => URL.revokeObjectURL(url))
    }
  }, [thumbnails])

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Main container with border */}
        <div className="bg-blue-50 border border-blue-200 border-dashed rounded-2xl min-h-[500px] flex flex-col">
          {/* Content area */}
          <div className="flex-1 flex items-center justify-center p-8">
            {pageState === 'upload' && (
              <FileUploader onFilesAdded={handleFilesAdded} existingCount={files.length} />
            )}

            {pageState === 'preview' && (
              <PreviewPage
                files={files}
                thumbnails={thumbnails}
                onRemove={handleRemoveFile}
                onFilesAdded={handleFilesAdded}
                onMerge={handleMerge}
                loading={loading}
                error={error}
              />
            )}

            {pageState === 'result' && mergeResult && (
              <ResultPage
                result={mergeResult}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
