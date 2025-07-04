// /api/mergePdfs/route.js
import { NextResponse } from 'next/server';
import { mergePdfs } from '../useCases/mergePdfs';
import { withErrorHandling, validateBody } from '../middlewares';

// Manejador para el método POST
export const POST = withErrorHandling(
  validateBody(['pdfUrls'], async (req) => {
    const buffer = await mergePdfs(req.validatedBody.pdfUrls);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/pdf' },
    });
  })
);
