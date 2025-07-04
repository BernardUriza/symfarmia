import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(pdfUrls) {
  const mergedPdf = await PDFDocument.create();
  for (const pdfUrl of pdfUrls) {
    const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    const copiedPages = await mergedPdf.copyPages(existingPdf, existingPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}
