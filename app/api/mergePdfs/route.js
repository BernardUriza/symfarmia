// /api/mergePdfs/route.js
import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server';

// Manejador para el método POST
export const POST = async (req) => {
  try {
    const body = await req.json();
    const { pdfUrls } = body; // Array de URLs de los PDFs a concatenar
    const mergedPdf = await PDFDocument.create();

    for (const pdfUrl of pdfUrls) {
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
      const existingPdf = await PDFDocument.load(existingPdfBytes);
      const copiedPages = await mergedPdf.copyPages(existingPdf, existingPdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    
    // Crear una instancia de NextResponse para manejar la respuesta
    const response = new NextResponse(Buffer.from(mergedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    // No es necesario llamar a NextResponse aquí, ya que Response ya está configurado correctamente
    return response;
  } catch (error) {
    // Usar NextResponse para manejar errores
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
