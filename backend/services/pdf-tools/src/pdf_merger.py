import fitz  # PyMuPDF
import re
from dataclasses import dataclass


@dataclass
class MergeCommand:
    file_index: int  # 1-based
    page_range: str


@dataclass
class MergeOptions:
    keep_bookmarks: bool = False
    print_mode: bool = False


@dataclass
class ParsedCommands:
    commands: list[MergeCommand]
    options: MergeOptions


def analyze_pdf(content: bytes) -> dict:
    """分析 PDF 文件"""
    doc = fitz.open(stream=content, filetype="pdf")

    # 检查是否加密
    if doc.is_encrypted:
        doc.close()
        return {
            "pageCount": 0,
            "hasBookmarks": False,
            "isEncrypted": True
        }

    page_count = len(doc)
    has_bookmarks = len(doc.get_toc()) > 0

    doc.close()

    return {
        "pageCount": page_count,
        "hasBookmarks": has_bookmarks,
        "isEncrypted": False
    }


def parse_commands(commands_str: str, file_count: int) -> ParsedCommands:
    """解析命令字符串"""
    lines = [line.strip() for line in commands_str.split('\n') if line.strip()]
    commands = []
    options = MergeOptions()

    for line in lines:
        # 解析选项
        if line.startswith('--'):
            if line == '--keep-bookmarks':
                options.keep_bookmarks = True
            elif line == '--print':
                options.print_mode = True
            else:
                raise ValueError(f"未知选项: {line}")
            continue

        # 解析 file_index:page_range
        match = re.match(r'^(\d+):(.+)$', line)
        if not match:
            raise ValueError(f"格式错误: {line}")

        file_index = int(match.group(1))
        page_range = match.group(2).strip()

        if file_index < 1 or file_index > file_count:
            raise ValueError(f"文件编号 {file_index} 不存在")

        if not validate_page_range(page_range):
            raise ValueError(f"页码格式错误: {page_range}")

        commands.append(MergeCommand(file_index=file_index, page_range=page_range))

    return ParsedCommands(commands=commands, options=options)


def validate_page_range(range_str: str) -> bool:
    """验证页码范围格式"""
    if range_str == 'all':
        return True
    pattern = r'^(\d+(-\d+)?)(,\d+(-\d+)?)*$'
    return bool(re.match(pattern, range_str))


def expand_page_range(range_str: str, total_pages: int) -> list[int]:
    """展开页码范围为页码列表 (0-based)"""
    if range_str == 'all':
        return list(range(total_pages))

    pages = []
    parts = range_str.split(',')

    for part in parts:
        if '-' in part:
            start, end = map(int, part.split('-'))
            # 转换为 0-based，并限制范围
            for i in range(start - 1, min(end, total_pages)):
                if i >= 0:
                    pages.append(i)
        else:
            page = int(part) - 1  # 转换为 0-based
            if 0 <= page < total_pages:
                pages.append(page)

    return pages


def merge_pdfs(file_contents: list[bytes], parsed: ParsedCommands) -> bytes:
    """执行 PDF 合并"""
    # 打开所有源文件
    docs = []
    for content in file_contents:
        doc = fitz.open(stream=content, filetype="pdf")
        if doc.is_encrypted:
            for d in docs:
                d.close()
            raise ValueError("不支持加密的 PDF 文件")
        docs.append(doc)

    # 创建输出文档
    output = fitz.open()
    bookmarks = []
    current_page = 0

    try:
        for cmd in parsed.commands:
            doc = docs[cmd.file_index - 1]
            pages = expand_page_range(cmd.page_range, len(doc))

            if not pages:
                continue

            # 如果需要保留书签，记录文件的起始位置
            if parsed.options.keep_bookmarks:
                # 添加文件级书签
                toc = doc.get_toc()
                if toc:
                    # 创建文件名作为顶级书签
                    bookmarks.append([1, f"文件 {cmd.file_index}", current_page + 1])
                    # 添加原有书签（调整层级和页码）
                    for item in toc:
                        level, title, page = item[0], item[1], item[2]
                        # 只添加在选中页面范围内的书签
                        if page - 1 in pages:
                            new_page = current_page + pages.index(page - 1) + 1
                            bookmarks.append([level + 1, title, new_page])

            # 插入页面
            for page_num in pages:
                output.insert_pdf(doc, from_page=page_num, to_page=page_num)
                current_page += 1

        # 设置书签
        if parsed.options.keep_bookmarks and bookmarks:
            output.set_toc(bookmarks)

        # 如果是打印模式，移除空白尾页
        if parsed.options.print_mode:
            remove_trailing_blank_pages(output)

        # 导出
        result = output.tobytes()
        return result

    finally:
        output.close()
        for doc in docs:
            doc.close()


def remove_trailing_blank_pages(doc: fitz.Document):
    """移除尾部空白页"""
    while len(doc) > 1:
        last_page = doc[-1]
        # 检查页面是否为空（无文本、无图片）
        text = last_page.get_text().strip()
        images = last_page.get_images()
        if not text and not images:
            doc.delete_page(-1)
        else:
            break
