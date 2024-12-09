/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Volume2, OctagonX, PlayCircle, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Comprehensive language and voice configurations
const LANGUAGE_VOICES = {
  'en': [
    { code: 'en-US', name: 'US English (Female)', gender: 'female' },
    { code: 'en-GB', name: 'UK English (Male)', gender: 'male' },
    { code: 'en-AU', name: 'Australian English (Female)', gender: 'female' },
  ],
  'es': [
    { code: 'es-ES', name: 'Spanish (Female)', gender: 'female' },
    { code: 'es-MX', name: 'Mexican Spanish (Male)', gender: 'male' },
  ],
  'fr': [
    { code: 'fr-FR', name: 'French (Female)', gender: 'female' },
    { code: 'fr-CA', name: 'Canadian French (Male)', gender: 'male' },
  ],
  'de': [
    { code: 'de-DE', name: 'German (Female)', gender: 'female' },
  ],
  'it': [
    { code: 'it-IT', name: 'Italian (Female)', gender: 'female' },
  ],
  'ja': [
    { code: 'ja-JP', name: 'Japanese (Female)', gender: 'female' },
  ],
  'ko': [
    { code: 'ko-KR', name: 'Korean (Female)', gender: 'female' },
  ],
  'zh': [
    { code: 'zh-CN', name: 'Chinese (Female)', gender: 'female' },
  ],
  'pt': [
    { code: 'pt-BR', name: 'Brazilian Portuguese (Female)', gender: 'female' },
    { code: 'pt-PT', name: 'European Portuguese (Male)', gender: 'male' },
  ],
  'ru': [
    { code: 'ru-RU', name: 'Russian (Female)', gender: 'female' },
  ],
  'ar': [
    { code: 'ar-SA', name: 'Arabic (Female)', gender: 'female' },
  ],
  'hi': [
    { code: 'hi-IN', name: 'Hindi (Female)', gender: 'female' },
  ]
};

// Type definitions
type LanguageCode = keyof typeof LANGUAGE_VOICES;
type VoiceConfig = { code: string, name: string, gender: string };

const TextToSpeech: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [rate, setRate] = useState(1);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Get available voices for the selected language
  const availableVoices = LANGUAGE_VOICES[sourceLang] || [];

  // Ensure selected voice is valid for the language
  useEffect(() => {
    if (availableVoices.length > 0) {
      // If current voice is not in available voices, reset to first voice
      if (!availableVoices.some(voice => voice.code === selectedVoice)) {
        setSelectedVoice(availableVoices[0].code);
      }
    }
  }, [sourceLang, selectedVoice]);

  // Stop speech if component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const speak = useCallback(async () => {
    // Input validation
    if (!inputText.trim()) {
      toast.error('Please enter some text to speak');
      return;
    }

    try {
      setIsPlaying(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          sourceLang: selectedVoice, 
          volume: volume / 100,
          rate 
        }),
      });

      const data = await response.json();

      if (data.audioBase64) {
        // Stop any existing audio
        if (audioElement) {
          audioElement.pause();
        }

        // Create new audio element
        const newAudio = new Audio(data.audioBase64);
        
        // Apply volume and playback rate
        newAudio.volume = volume / 100;
        
        // Event listeners
        newAudio.onended = () => setIsPlaying(false);

        // Play and store audio element
        await newAudio.play();
        setAudioElement(newAudio);
      } else {
        throw new Error('No audio data');
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Failed to generate or play speech');
      setIsPlaying(false);
    }
  }, [inputText, selectedVoice, volume, rate, audioElement]);

  // Stop speech function
  const stopSpeech = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  }, [audioElement]);

  return (
    <div className="bg-white p-2 w-full max-w-md mx-auto">
      
      {/* Language and Voice Selection */}
      <div className="flex space-x-2 mb-4">
        {/* Language Selector */}
        <Select value={sourceLang} onValueChange={(value: LanguageCode) => setSourceLang(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(LANGUAGE_VOICES).map((langCode) => (
              <SelectItem key={langCode} value={langCode}>
                {LANGUAGE_VOICES[langCode as LanguageCode][0].name.split(' ')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Voice Selector */}
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.map((voice) => (
              <SelectItem key={voice.code} value={voice.code}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Input */}
      <textarea 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to speak"
        className="w-full min-h-[100px] p-2 border rounded mb-4"
        maxLength={500}
      />

      {/* Advanced Settings */}
      <div className="mb-4 space-y-2">
        {/* Volume Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-sm">Volume</span>
          <Slider 
            value={[volume]} 
            onValueChange={(value) => setVolume(value[0])}
            min={0}
            max={100}
            step={1}
            className="flex-grow"
          />
          <span className="text-sm w-10 text-right">{volume}%</span>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-sm">Speed</span>
          <Slider 
            value={[rate * 10]} 
            onValueChange={(value) => setRate(value[0] / 10)}
            min={5}
            max={20}
            step={1}
            className="flex-grow"
          />
          <span className="text-sm w-10 text-right">{rate.toFixed(1)}x</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2">
        {/* Play/Stop Button */}
        <Button 
          onClick={isPlaying ? stopSpeech : speak} 
          disabled={!inputText}
          className="flex-grow"
        >
          {isPlaying ? (
            <>
              <OctagonX className="mr-2 h-4 w-4" /> Stop
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" /> Speak
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextToSpeech