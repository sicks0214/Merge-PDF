import { useState, useCallback } from 'react'
import { FileUploader } from './components/FileUploader'
import { FileList } from './components/FileList'
import { CommandInput } from './components/CommandInput'
import { PDFFile } from './types'
import { parseCommands } from './utils/commandParser'
import { mergePDFs, downloadBlob, analyzePDF } from './api/merge'

function App() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [commands, setCommands] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilesAdded = useCallback(async (newFiles: PDFFile[]) => {
    // 分析每个 PDF 文件获取信息
    const analyzedFiles = await Promise.all(
      newFiles.map(async (pdfFile) => {
        try {
          const info = await analyzePDF(pdfFile.file)
          return { ...pdfFile, ...info }
        } catch {
          return pdfFile
        }
      })
    )

    setFiles(prev => [...prev, ...analyzedFiles])
    setError(null)
  }, [])

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      setError('请先上传 PDF 文件')
      return
    }

    // 如果没有输入命令，生成默认命令（合并所有文件的全部页面）
    let finalCommands = commands.trim()
    if (!finalCommands) {
      finalCommands = files.map((_, i) => `${i + 1}:all`).join('\n')
    }

    // 验证命令
    const parsed = parseCommands(finalCommands, files.length)
    if (parsed.errors.length > 0) {
      setError(parsed.errors.join('\n'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const blob = await mergePDFs(files, finalCommands)
      downloadBlob(blob, 'merged.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : '合并失败')
    } finally {
      setLoading(false)
    }
  }, [files, commands])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <FileUploader onFilesAdded={handleFilesAdded} existingCount={files.length} />

        <FileList files={files} onRemove={handleRemoveFile} />

        {files.length > 0 && (
          <>
            <CommandInput value={commands} onChange={setCommands} />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleMerge}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '合并中...' : '合并'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
