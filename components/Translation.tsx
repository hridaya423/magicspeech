/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Loader2, Copy, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Comprehensive list of languages with improved typing
const LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
} as const;

type LanguageCode = keyof typeof LANGUAGES;

// Translation API interface for better type safety
interface TranslationAPI {
  name: string;
  url: string;
  method: (text: string, source: string, target: string) => Promise<string>;
}

// Translation APIs with fallback mechanism
const TRANSLATION_APIS: TranslationAPI[] = [
  {
    name: 'MyMemory Translate',
    url: 'https://api.mymemory.translated.net/get',
    method: async (text: string, source: string, target: string) => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
        );

        if (!response.ok) throw new Error('MyMemory Translation Failed');
        
        const data = await response.json();
        return data.responseData.translatedText;
      } catch (error) {
        console.error('MyMemory error:', error);
        throw error;
      }
    }
  }
];

const Translation: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentApiIndex, setCurrentApiIndex] = useState(0);

  // Memoized translation function to prevent unnecessary rerenders
  const translateText = useCallback(async () => {
    // Input validation
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    if (sourceLang === targetLang) {
      toast.error('Source and target languages must be different');
      return;
    }

    setIsTranslating(true);
    setOutputText('');

    try {
      // Create a copy of the APIs to allow full cycling
      const apis = [...TRANSLATION_APIS];
      
      // Function to attempt translation with current API
      const attemptTranslation = async (apiIndex: number): Promise<string> => {
        if (apiIndex >= apis.length) {
          throw new Error('All translation services failed');
        }

        try {
          const currentApi = apis[apiIndex];
          const translatedText = await currentApi.method(inputText, sourceLang, targetLang);
          
          // Success toast
          toast.success(`Translation completed.`);
          return translatedText;
        } catch (error) {
          // If current API fails, try next one
          console.warn(`${apis[apiIndex].name} failed, trying next service`);
          return attemptTranslation(apiIndex + 1);
        }
      };

      // Attempt translation
      const result = await attemptTranslation(0);
      setOutputText(result);
    } catch (error) {
      // Final fallback error handling
      console.error('Translation error:', error);
      toast.error('Translation failed. Please check your internet connection.');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLang, targetLang]);

  // Swap source and target languages
  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    
    // Also swap input and output text
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  // Copy output text to clipboard
  const copyOutputText = () => {
    if (outputText.trim()) {
      navigator.clipboard.writeText(outputText)
        .then(() => toast.success('Translation copied to clipboard'))
        .catch(() => toast.error('Failed to copy translation'));
    } else {
      toast.error('No text to copy');
    }
  };

  // Allow translation on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to translate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      translateText();
    }
  };

  return (
    <div className="bg-white p-2 w-full max-w-md mx-auto">
      
      <div className="flex items-center space-x-2 mb-4">
        {/* Source Language Selector */}
        <Select value={sourceLang} onValueChange={(value: LanguageCode) => setSourceLang(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Source Language" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Language Swap Button */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={swapLanguages}
          className="px-2 shrink-0"
          title="Swap Languages"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        {/* Target Language Selector */}
        <Select value={targetLang} onValueChange={(value: LanguageCode) => setTargetLang(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Target Language" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Input Textarea */}
      <Textarea 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter text to translate (Cmd/Ctrl + Enter to translate)"
        className="mb-4 min-h-[150px]" 
      />

      {/* Output Textarea with Copy Button */}
      <div className="relative mb-4">
        <Textarea 
          value={outputText} 
          readOnly
          placeholder="Translation will appear here"
          className="min-h-[150px]" 
        />
        {outputText && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={copyOutputText}
            className="absolute top-2 right-2 h-8 w-8"
            title="Copy Translation"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Translate Button */}
      <Button 
        onClick={translateText} 
        disabled={isTranslating}
        className="w-full"
      >
        {isTranslating ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...</>
        ) : (
          <><Languages className="mr-2 h-4 w-4" /> Translate</>
        )}
      </Button>
    </div>
  );
};

export default Translation