import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { type LanguageCode, } from '@/components/SpeechToText';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mapping Speechmatics language codes to OpenAI's language codes
const LANGUAGE_MAP: Record<LanguageCode, string> = {
  'en-US': 'en',
  'en-GB': 'en',
  'es': 'es',
  'fr': 'fr', 
  'de': 'de',
  'it': 'it',
  'pt': 'pt',
  'ru': 'ru',
  'zh': 'zh',
  'ja': 'ja',
  'ar': 'ar'
};

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const sourceLang = formData.get('sourceLang') as LanguageCode;

    // Validate inputs
    if (!audioFile || !sourceLang) {
      return NextResponse.json(
        { error: 'Missing audio file or language' }, 
        { status: 400 }
      );
    }

    // Check file size
    if (audioFile.size > 25 * 1024 * 1024) {  // 25MB limit for OpenAI
      return NextResponse.json(
        { error: 'Audio file too large. Maximum 25MB allowed.' }, 
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Create a File object for OpenAI API
    const audioFileForUpload = new File(
      [audioBuffer], 
      'recording.wav', 
      { type: 'audio/wav' }
    );

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForUpload,
      model: 'whisper-1',
      language: LANGUAGE_MAP[sourceLang] || 'en'  // Fallback to English
    });

    return NextResponse.json({ 
      transcript: transcription.text,
      confidence: 1  // OpenAI doesn't provide confidence, so default to high
    });

  } catch (error) {
    console.error('Transcription error:', error);

    return NextResponse.json(
      { 
        error: 'Speech-to-text transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}