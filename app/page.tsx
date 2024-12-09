'use client'
import React from 'react'
import dynamic from 'next/dynamic'

const SpeechToText = dynamic(() => import('../components/SpeechToText'), {
  ssr: false
})
const TextToSpeech = dynamic(() => import('../components/TextToSpeech'), {
  ssr: false
})
const Translation = dynamic(() => import('../components/Translation'), {
  ssr: false
})

import { Toaster } from 'react-hot-toast'
import { 
  Languages, 
  Volume2, 
  Mic, 
  CircleIcon 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }} 
      />
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            MagicSpeech
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seamlessly translate, speak, and transcribe across multiple languages
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Text to Speech Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Volume2 className="text-blue-600 mr-3" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Text to Speech</h2>
              </div>
              <TextToSpeech />
            </div>
          </div>

          {/* Speech to Text Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Mic className="text-green-600 mr-3" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Speech to Text</h2>
              </div>
              <SpeechToText />
            </div>
          </div>

          {/* Translation Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Languages className="text-purple-600 mr-3" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">Universal Translator</h2>
              </div>
              <Translation />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-3 text-gray-500">
            <CircleIcon size={8} className="text-blue-500" />
            <p className="text-sm">Made with ❤️ by Hridya</p>
            <CircleIcon size={8} className="text-blue-500" />
          </div>
        </footer>
      </div>
    </div>
  )
}