'use client'
import React, { useState, useEffect } from 'react';
import { ElevenLabsClient } from 'elevenlabs';
import { Play, StopCircle, Loader2, AlertCircle } from 'lucide-react';

const client = new ElevenLabsClient({
  apiKey: 'sk_db2fb5d6d6fdde9761fcab5fde804ffb4626c89bf5388af6', // Replace with your actual API key
});

const TextToSpeechPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio URL when component unmounts
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    };
  }, [audioBlobUrl]);

  const handlePlayPause = async () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        await audioElement.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
        text: `Munafa Technology specializes in providing loans to farmers and SMEs, offering insurance services and neo-banking solutions.`,
        model_id: 'eleven_multilingual_v2',
      });

      const audioChunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        audioChunks.push(chunk);
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      setAudioBlobUrl(url);
      
      const audio = new Audio(url);
      setAudioElement(audio);
      
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isPlaying ? 'bg-blue-700' : 'bg-[#244F45]'
        }`}
        style={{
          transition: 'background-color 0.3s ease-in-out, opacity 0.3s ease-in-out',
          opacity: isPlaying ? 1 : 0.8,
          color: 'white',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isPlaying ? (
          <>
            <StopCircle className="w-5 h-5" />
            <span>Stop Audio</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>play now</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-red-600 text-sm mt-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* <div className="text-sm text-gray-600 mt-2">
        <p>Current Text:</p>
        <p className="font-medium mt-1 bg-gray-50 p-3 rounded-lg">
          "Munafa Technologies leads in digital innovation and transformative solutions."
        </p>
      </div> */}
    </div>
  );
};

export default TextToSpeechPlayer;