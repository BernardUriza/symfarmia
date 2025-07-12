import { NextRequest, NextResponse } from 'next/server';
import { nodewhisper } from 'nodejs-whisper';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    // Guardar temporalmente
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join('/tmp', `${Date.now()}-${audioFile.name}`);
    
    await writeFile(tempPath, buffer);
    // Usar modelo local desde public/models/
    const modelFullPath = path.join(process.cwd(), 'public', 'models', 'ggml-base.en.bin');

    // Transcribir con nodejs-whisper
    const result = await nodewhisper(tempPath, {
      modelName: modelFullPath,
      removeWavFileAfterTranscription: false,
      whisperOptions: {
        wordTimestamps: true,
        outputInJson: true
      }
    });

    // Limpiar archivo temporal
    await unlink(tempPath);

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}