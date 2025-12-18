import { useState, useCallback, useEffect } from 'react'
import { PDFFile } from './types'
import { mergePDFs, analyzePDF, downloadBlob } from './api/merge'
import { Breadcrumb } from './components/Breadcrumb'
import { CoreToolArea } from './components/CoreToolArea'
import { InlineFeedback } from './components/InlineFeedback'
import { UseCaseAccordion, UseCaseOptions } from './components/UseCaseAccordion'
import { HowToSection } from './components/HowToSection'
import { FAQSection } from './components/FAQSection'
import './index.css'

function App() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
  const [useCaseOptions, setUseCaseOptions] = useState<UseCaseOptions>({
    optimizeForPrint: false,
    keepBookmarks: false,
    usePageRange: false,
  })

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'PDF Tools', href: '/pdf-tools' },
    { label: 'Merge PDF' },
  ]

  // Handle files added
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const pdfFiles: PDFFile[] = []

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
        pageRange: 'all',
      })
    }

    if (pdfFiles.length === 0) {
      setFeedback({ message: 'Please upload PDF files only', type: 'error' })
      return
    }

    // Analyze files
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

    setFiles((prev) => [...prev, ...analyzedFiles])
    setFeedback(null)
  }, [])

  // Handle file removal
  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // Handle file reordering
  const handleReorderFiles = useCallback((newFiles: PDFFile[]) => {
    setFiles(newFiles)
  }, [])

  // Handle page range change
  const handlePageRangeChange = useCallback((fileId: string, pageRange: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, pageRange } : f))
    )
  }, [])

  // Handle use case options change
  const handleUseCaseOptionsChange = useCallback((options: UseCaseOptions) => {
    setUseCaseOptions(options)

    // Show feedback
    if (options.optimizeForPrint) {
      setFeedback({ message: '✓ Printing settings applied', type: 'success' })
    } else if (options.keepBookmarks) {
      setFeedback({ message: '✓ Bookmarks will be preserved', type: 'success' })
    } else if (options.usePageRange) {
      setFeedback({ message: '✓ Page range mode enabled', type: 'info' })
    }

    // Auto-hide feedback after 3 seconds
    setTimeout(() => setFeedback(null), 3000)
  }, [])

  // Handle merge
  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      setFeedback({ message: 'Please upload PDF files first', type: 'error' })
      return
    }

    // Check for encrypted files
    const hasEncrypted = files.some((f) => f.isEncrypted)
    if (hasEncrypted) {
      setFeedback({
        message: 'Cannot merge encrypted PDF files. Please remove password protection first.',
        type: 'error',
      })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      // Build command string based on options
      const commands: string[] = []

      // Add file commands with page ranges
      files.forEach((file, index) => {
        const pageRange = useCaseOptions.usePageRange && file.pageRange ? file.pageRange : 'all'
        commands.push(`${index + 1}:${pageRange}`)
      })

      // Add option flags
      if (useCaseOptions.keepBookmarks) {
        commands.push('--keep-bookmarks')
      }
      if (useCaseOptions.optimizeForPrint) {
        commands.push('--print')
      }

      const commandString = commands.join('\n')

      // Call API
      const blob = await mergePDFs(files, commandString)

      // Download the result
      const baseName = files[0].name.replace('.pdf', '')
      const fileName = `${baseName}-merged.pdf`
      downloadBlob(blob, fileName)

      setFeedback({
        message: `✓ Successfully merged ${files.length} PDF file${files.length > 1 ? 's' : ''}!`,
        type: 'success',
      })

      // Auto-hide success message after 5 seconds
      setTimeout(() => setFeedback(null), 5000)
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Merge failed. Please try again.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [files, useCaseOptions])

  // Clear feedback on file changes
  useEffect(() => {
    if (files.length === 0 && feedback?.type === 'success') {
      setFeedback(null)
    }
  }, [files, feedback])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Merge PDF</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Combine multiple PDF files into one document. Upload your PDFs, arrange them in order,
            and merge them instantly. Free, secure, and easy to use.
          </p>
        </header>

        {/* Core Tool Area - Fixed position */}
        <section className="mb-8">
          <CoreToolArea
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onReorderFiles={handleReorderFiles}
            onMerge={handleMerge}
            loading={loading}
            usePageRange={useCaseOptions.usePageRange}
            onPageRangeChange={handlePageRangeChange}
          />
        </section>

        {/* Inline Feedback */}
        {feedback && <InlineFeedback message={feedback.message} type={feedback.type} />}

        {/* Use Case Accordion */}
        <UseCaseAccordion options={useCaseOptions} onOptionsChange={handleUseCaseOptionsChange} />

        {/* How-to Section */}
        <HowToSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Toolibox. All files are processed securely and deleted automatically.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
