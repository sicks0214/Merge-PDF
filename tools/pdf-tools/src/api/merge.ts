import { PDFFile } from '../types'

const API_BASE = '/api/pdf'

export interface MergeRequest {
  files: File[]
  commands: string
}

export interface PDFInfo {
  pageCount: number
  hasBookmarks: boolean
  isEncrypted: boolean
}

export async function analyzePDF(file: File): Promise<PDFInfo> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('PDF 分析失败')
  }

  return response.json()
}

export async function mergePDFs(files: PDFFile[], commands: string): Promise<Blob> {
  const formData = new FormData()

  files.forEach((pdfFile, index) => {
    formData.append('files', pdfFile.file, `${index + 1}_${pdfFile.name}`)
  })

  formData.append('commands', commands)

  const response = await fetch(`${API_BASE}/merge`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || '合并失败')
  }

  return response.blob()
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
