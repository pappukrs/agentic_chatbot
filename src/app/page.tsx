'use client'
import React, { useState } from 'react';
import { Conversation } from '@/components/conversation';
import TextToSpeechPlayer from '@/components/TextToSpeechPlayer';
import Support from '@/components/Support';
import { MessageCircle, ChevronRight, X } from 'lucide-react';

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                style={{ color: '#244F45' }}
              >
                Munafa Voice Assistant
              </span>
            </h1>
            

          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversation Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Interactive Voice Chat
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </h2>
            <Conversation />
           
          </div>

          {/* Text to Speech Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Wanted to know about Munafa?</h2>
            <TextToSpeechPlayer />
            
          </div>
        </div>
      </div>

      {/* Chatbot FAB */}
      {/* <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        {showChatbot ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button> */}

      {/* Chatbot Overlay */}
      {/* {showChatbot && (
        <div className="fixed bottom-24 right-8 w-96 bg-white rounded-xl shadow-xl">
          <Support />
        </div>
      )} */}

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-sm text-gray-600">
            © 2024 Munafa Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}