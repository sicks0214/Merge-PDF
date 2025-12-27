"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_lib_1 = require("pdf-lib");

function parsePageRange(range, totalPages) {
    if (range === 'all' || range === '') {
        return Array.from({ length: totalPages }, (_, i) => i);
    }
    const pages = [];
    const parts = range.split(',').map(p => p.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start - 1; i < Math.min(end, totalPages); i++) {
                if (i >= 0 && !pages.includes(i))
                    pages.push(i);
            }
        }
        else {
            const page = parseInt(part, 10) - 1;
            if (page >= 0 && page < totalPages && !pages.includes(page))
                pages.push(page);
        }
    }
    return pages.sort((a, b) => a - b);
}

async function handler(req, res) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: true, message: 'No files uploaded' });
        }
        const options = req.body.options ? JSON.parse(req.body.options) : {};
        const pageRanges = req.body.pageRanges ? JSON.parse(req.body.pageRanges) : [];
        const mergedPdf = await pdf_lib_1.PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pdf = await pdf_lib_1.PDFDocument.load(file.buffer);
            const totalPages = pdf.getPageCount();
            const pageRange = options.usePageRange && pageRanges[i] ? pageRanges[i] : 'all';
            const pageIndices = parsePageRange(pageRange, totalPages);
            if (pageIndices.length === 0)
                continue;
            const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        if (mergedPdf.getPageCount() === 0) {
            return res.status(400).json({ error: true, message: 'No pages to merge' });
        }
        const pdfBytes = await mergedPdf.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
        res.send(Buffer.from(pdfBytes));
    }
    catch (error) {
        console.error('Merge error:', error);
        res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : 'Merge failed'
        });
    }
}

async function analyze(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: true, message: 'No file uploaded' });
        }
        const pdf = await pdf_lib_1.PDFDocument.load(file.buffer, { ignoreEncryption: true });
        const pageCount = pdf.getPageCount();
        res.json({
            pageCount,
            hasBookmarks: false,
            isEncrypted: false,
        });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('encrypted')) {
            return res.json({
                pageCount: 0,
                hasBookmarks: false,
                isEncrypted: true,
            });
        }
        console.error('Analyze error:', error);
        res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : 'Analysis failed'
        });
    }
}

module.exports = { handler, analyze };
exports.default = { handler, analyze };
