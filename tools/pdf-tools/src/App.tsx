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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Merge PDF Files
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Combine multiple PDF files into one document instantly.
            <span className="block mt-2 text-base text-gray-500">Free, secure, and easy to use • No registration required</span>
          </p>
        </header>

        {/* Core Tool Area - Fixed position */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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
          </div>
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
        <footer className="mt-20 py-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy Protected</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">© 2024 Toolibox. All files are processed securely and deleted automatically.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
