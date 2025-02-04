// chatbot/src/components/TextToSpeechPlayer.tsx

'use client'
import React from 'react';
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({
  apiKey: 'sk_db2fb5d6d6fdde9761fcab5fde804ffb4626c89bf5388af6', // Replace with your actual API key
});

const TextToSpeechPlayer: React.FC = () => {
  const handlePlay = async () => {
    try {
      const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
        text: `Munafa Technologies leads in digital innovation and transformative solutions.`,
        model_id: 'eleven_multilingual_v2',
      });

      const audioChunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        audioChunks.push(chunk);
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <button onClick={handlePlay} className="play-button">
      Play
    </button>
  );
};

export default TextToSpeechPlayer;