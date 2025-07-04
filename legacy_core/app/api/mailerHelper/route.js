import { NextResponse } from 'next/server';
import { sendTokenByEmail } from '../useCases/mailerHelper';
import { withErrorHandling, validateBody } from '../middlewares';

export const POST = withErrorHandling(
  validateBody(['to', 'subject'], async (req) => {
    await sendTokenByEmail(req.validatedBody);
    return NextResponse.json({ success: true }, { status: 200 });
  })
);
