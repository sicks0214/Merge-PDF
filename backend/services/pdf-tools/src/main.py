from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
from .pdf_merger import analyze_pdf, merge_pdfs, parse_commands

app = FastAPI(title="PDF Tools API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/pdf/analyze")
async def analyze(file: UploadFile = File(...)):
    """分析 PDF 文件，返回页数、书签等信息"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="只支持 PDF 文件")

    content = await file.read()
    try:
        info = analyze_pdf(content)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/pdf/merge")
async def merge(
    files: list[UploadFile] = File(...),
    commands: str = Form(...)
):
    """合并 PDF 文件"""
    print(f"[DEBUG] 收到合并请求，文件数量: {len(files)}")
    print(f"[DEBUG] 命令: {commands}")

    if len(files) == 0:
        raise HTTPException(status_code=400, detail="请上传至少一个 PDF 文件")

    # 读取所有文件内容
    file_contents = []
    for f in files:
        print(f"[DEBUG] 处理文件: {f.filename}")
        if not f.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"文件 {f.filename} 不是 PDF 格式")
        content = await f.read()
        file_contents.append(content)
        print(f"[DEBUG] 文件大小: {len(content)} 字节")

    # 解析命令
    try:
        parsed = parse_commands(commands, len(file_contents))
        print(f"[DEBUG] 命令解析成功")
    except ValueError as e:
        print(f"[ERROR] 命令解析失败: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    # 执行合并
    try:
        print(f"[DEBUG] 开始合并 PDF...")
        result = merge_pdfs(file_contents, parsed)
        print(f"[DEBUG] 合并成功，输出大小: {len(result)} 字节")
        return StreamingResponse(
            io.BytesIO(result),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged.pdf"}
        )
    except Exception as e:
        print(f"[ERROR] 合并失败: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"合并失败: {str(e)}")
