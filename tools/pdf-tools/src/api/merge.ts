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

  console.log('[前端] 开始发送合并请求...')
  console.log('[前端] 文件数量:', files.length)
  console.log('[前端] 命令:', commands)

  try {
    // 创建一个带超时的 fetch 请求（60秒超时）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn('[前端] 请求超时，正在取消...')
      controller.abort()
    }, 60000) // 60 秒超时

    const response = await fetch(`${API_BASE}/merge`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log('[前端] 收到响应，状态码:', response.status)

    if (!response.ok) {
      let errorMsg = '合并失败'
      try {
        const error = await response.json()
        errorMsg = error.detail || errorMsg
      } catch {
        errorMsg = `HTTP ${response.status}: ${response.statusText}`
      }
      console.error('[前端] 请求失败:', errorMsg)
      throw new Error(errorMsg)
    }

    // 检查响应大小
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      console.log('[前端] 响应大小:', Math.round(parseInt(contentLength) / 1024), 'KB')
    }

    console.log('[前端] 正在读取响应体...')
    const startTime = Date.now()
    const blob = await response.blob()
    const duration = Date.now() - startTime
    console.log('[前端] 合并成功，文件大小:', Math.round(blob.size / 1024), 'KB')
    console.log('[前端] 读取耗时:', duration, 'ms')
    return blob
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[前端] 请求超时')
      throw new Error('合并超时，请尝试减少文件数量或文件大小')
    }
    console.error('[前端] 请求异常:', error)
    throw error
  }
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
