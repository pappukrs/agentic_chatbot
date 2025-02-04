'use client'
import React, { useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import AudioWave from './AudioWave';

function Support() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'm listening to you. Click the microphone to start.", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentSpeech, setCurrentSpeech] = useState('');

  const toggleListening = () => {
    setIsListening(!isListening);
    if (isListening) {
      // If stopping, add the current speech to messages
      if (currentSpeech.trim()) {
        setMessages(prev => [...prev, { text: currentSpeech, isUser: true }]);
        setCurrentSpeech('');
      }
    }
  };

  const handleSpeechResult = (text: string) => {
    setCurrentSpeech(text);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { text: inputText, isUser: true }]);
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I received your message! I'm a demo bot.", 
          isUser: false 
        }]);
      }, 1000);
      setInputText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 bg-blue-500 text-white">
          <h1 className="text-2xl font-bold">Voice-Enabled Chatbot</h1>
          <p className="text-blue-100">Speak or type your message</p>
        </div>
        
        <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Show current speech while listening */}
          {isListening && currentSpeech && (
            <div className="flex justify-end mb-4">
              <div className="rounded-lg px-4 py-2 max-w-[70%] bg-blue-400 text-white">
                {currentSpeech}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <AudioWave 
            isListening={isListening} 
            onSpeechResult={handleSpeechResult}
          />
          
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            <button
              onClick={handleSendMessage}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;