'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState, useRef } from 'react';
import AudioWave from './AudioWave'; // Import the AudioWave component

// Define types for message and error
interface ConversationMessage {
  text: string; // Adjust based on the actual message structure
}

interface ConversationError {
  message: string;
}

export function Conversation() {
  const [userStopped, setUserStopped] = useState(false);
  const userStoppedRef = useRef(userStopped);

  const updateUserStopped = (value: boolean) => {
    setUserStopped(value);
    userStoppedRef.current = value;
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      updateUserStopped(false); // Reset the flag on connect
    },
    onDisconnect: () => {
      console.log('Disconnected');
      if (!userStoppedRef.current) {
        // Attempt to reconnect only if not user-initiated
        console.log('User did not stop the conversation, preparing to attempt reconnection.');
        setTimeout(() => {
          console.log('Attempting to reconnect...');

          // conversation.startSession({
          //   agentId: 'VKwf6Oe8o9xf8bFi93jV', 
          // }).catch(error => console.error('Reconnection failed:', error));


        }, 5000); // Retry after 5 seconds
      }
    },
    onMessage: (message: ConversationMessage) => console.log('Message:', message),
    onError: (error: ConversationError) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'VKwf6Oe8o9xf8bFi93jV', // Replace with actual agent ID
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    console.log('User is stopping the conversation.');
    updateUserStopped(true); // Set the flag when user stops the conversation
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 transition-colors duration-300 hover:bg-opacity-80"
          style={{ background: '#244F45' }}
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 transition-colors duration-300 hover:bg-opacity-80"
          style={{ background: '#244F45' }}
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
        {conversation.isSpeaking && (
          <AudioWave
            isListening={conversation.isSpeaking} // Pass the speaking state
            onSpeechResult={(text) => console.log('Speech Result:', text)} // Handle speech results
          />
        )}
      </div>
    </div>
  );
}
