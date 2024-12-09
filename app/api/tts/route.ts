/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Define interface for TTS request
interface TTSRequest {
  text: string;
  sourceLang: string;
  volume?: number;
  rate?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, volume = 1, rate = 1 }: TTSRequest = await req.json();

    // Validate input
    if (!text || !sourceLang) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    // Limit text length to prevent excessive API calls
    const truncatedText = text.slice(0, 500);

    // Prepare request to VoiceRSS API
    const response = await axios.post(
      `https://api.voicerss.org/`,
      new URLSearchParams({
        key: process.env.VOICERSS_API_KEY!,
        src: truncatedText,
        hl: sourceLang,
        r: '0', // Speech quality (0-2)
        c: 'wav',
        f: '16khz_16bit_stereo',
      }),
      {
        responseType: 'arraybuffer',
      }
    );

    // Convert audio to base64
    const audioBase64 = `data:audio/wav;base64,${Buffer.from(response.data).toString('base64')}`;
    
    return NextResponse.json({ 
      audioBase64,
      message: 'Speech generated successfully'
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // More detailed error handling
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        return NextResponse.json({ 
          error: 'External TTS service error', 
          details: error.response.data 
        }, { status: error.response.status });
      } else if (error.request) {
        // The request was made but no response was received
        return NextResponse.json({ 
          error: 'No response from TTS service' 
        }, { status: 503 });
      }
    }

    // Generic error fallback
    return NextResponse.json({ 
      error: 'Text-to-speech failed' 
    }, { status: 500 });
  }
}