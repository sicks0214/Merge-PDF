import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

interface MergeOptions {
  keepBookmarks?: boolean;
  optimizeForPrint?: boolean;
  usePageRange?: boolean;
  pageRanges?: { [fileIndex: number]: string };
}

function parsePageRange(range: string, totalPages: number): number[] {
  if (range === 'all' || range === '') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: number[] = [];
  const parts = range.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start - 1; i < Math.min(end, totalPages); i++) {
        if (i >= 0 && !pages.includes(i)) pages.push(i);
      }
    } else {
      const page = parseInt(part, 10) - 1;
      if (page >= 0 && page < totalPages && !pages.includes(page)) pages.push(page);
    }
  }

  return pages.sort((a, b) => a - b);
}

router.post('/merge', upload.array('files', 20), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const options: MergeOptions = req.body.options ? JSON.parse(req.body.options) : {};
    const pageRanges: string[] = req.body.pageRanges ? JSON.parse(req.body.pageRanges) : [];

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pdf = await PDFDocument.load(file.buffer);
      const totalPages = pdf.getPageCount();

      const pageRange = options.usePageRange && pageRanges[i] ? pageRanges[i] : 'all';
      const pageIndices = parsePageRange(pageRange, totalPages);

      if (pageIndices.length === 0) continue;

      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    if (mergedPdf.getPageCount() === 0) {
      return res.status(400).json({ message: 'No pages to merge' });
    }

    const pdfBytes = await mergedPdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({
      message: 'Merge failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
