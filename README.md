# Magic Speech 🎙️✨

## Project Overview

Magic Speech is a Next.js web application that provides advanced speech processing capabilities, including:
- Text-to-Speech conversion
- Speech-to-Text transcription
- Language Translation

![Project Preview](https://cloud-iw2rzomfe-hack-club-bot.vercel.app/0image.png)

## 🚀 Features

- **Text-to-Speech**: Convert written text to spoken audio
- **Speech-to-Text**: Transcribe spoken words into written text
- **Translation**: Translate text between multiple languages
- **Responsive UI**: Built with Tailwind CSS for a modern, mobile-friendly design

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **APIs**:
  - Speechmatics API (Speech processing)
  - VoiceRSS API (Text-to-Speech)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or later)
- npm or Yarn
- API keys for:
  - Speechmatics
  - VoiceRSS

## 🔧 Setup and Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/hridaya423/magic-speech.git
   cd magic-speech
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the project root and add:
   ```
   SPEECHMATICS_API_KEY=your_speechmatics_api_key
   VOICERSS_API_KEY=your_voicerss_api_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open Application**
   Navigate to `http://localhost:3000` in your browser


## 🔍 API Configuration

### Speechmatics API
- Sign up at [Speechmatics Developer Portal](https://www.speechmatics.com/)
- Create an API key
- Configure language and transcription settings in `config/speechmatics.js`

### VoiceRSS API
- Register at [VoiceRSS Website](https://www.voicerss.org/)
- Obtain your API key
- Set language and voice preferences in `config/voicerss.js`
