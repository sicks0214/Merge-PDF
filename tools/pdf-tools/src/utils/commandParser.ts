import { ParsedCommands, MergeCommand, MergeOptions } from '../types'

export function parseCommands(input: string, fileCount: number): ParsedCommands {
  const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const commands: MergeCommand[] = []
  const errors: string[] = []
  const options: MergeOptions = {
    keepBookmarks: false,
    printMode: false,
  }

  for (const line of lines) {
    // 解析选项
    if (line.startsWith('--')) {
      if (line === '--keep-bookmarks') {
        options.keepBookmarks = true
      } else if (line === '--print') {
        options.printMode = true
      } else {
        errors.push(`未知选项: ${line}`)
      }
      continue
    }

    // 解析文件:页码范围
    const match = line.match(/^(\d+):(.+)$/)
    if (!match) {
      errors.push(`格式错误: ${line}`)
      continue
    }

    const fileIndex = parseInt(match[1], 10)
    const pageRange = match[2].trim()

    if (fileIndex < 1 || fileIndex > fileCount) {
      errors.push(`文件编号 ${fileIndex} 不存在`)
      continue
    }

    if (!validatePageRange(pageRange)) {
      errors.push(`页码格式错误: ${pageRange}`)
      continue
    }

    commands.push({ fileIndex, pageRange })
  }

  return { commands, options, errors }
}

function validatePageRange(range: string): boolean {
  if (range === 'all') return true

  // 支持: 1, 1-5, 1,3,5, 1-3,5,7-9
  const pattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/
  return pattern.test(range)
}

export function expandPageRange(range: string, totalPages: number): number[] {
  if (range === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: number[] = []
  const parts = range.split(',')

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        pages.push(i)
      }
    } else {
      const page = parseInt(part, 10)
      if (page <= totalPages) {
        pages.push(page)
      }
    }
  }

  return pages
}
