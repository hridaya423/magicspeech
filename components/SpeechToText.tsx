'use client'

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Supported language codes for Speechmatics
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'US English' },
  { code: 'en-GB', name: 'UK English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' }
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const SpeechToText: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en-US');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop the stream tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await transcribeAudio(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [sourceLang]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  }, []);

  const transcribeAudio = async (audioBlob: Blob) => {
    if (isTranscribing) return;

    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('sourceLang', sourceLang);

      const response = await axios.post('/api/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.transcript) {
        setTranscript(response.data.transcript.trim());
        toast.success('Transcription complete');
      } else {
        throw new Error('No transcript received');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error instanceof Error ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2 bg-white  p-6 w-full max-w-md">
      <div className="flex items-center space-x-2 w-full">
        <Button
          variant={isRecording ? 'destructive' : 'default'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className="flex-1"
        >
          {isRecording ? (
            <>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </>
          )}
        </Button>

        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
          className="bg-gray-100 border-gray-300 rounded-md text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {isTranscribing && (
        <span className="text-sm text-muted-foreground">
          Transcribing...
        </span>
      )}

      {transcript && (
        <div className="bg-gray-100 rounded-md p-2 w-full">
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
