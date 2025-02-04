"use client"
import React, { useEffect, useRef } from 'react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface AudioWaveProps {
  isListening: boolean;
  onSpeechResult: (text: string) => void;
}

const AudioWave: React.FC<AudioWaveProps> = ({ isListening, onSpeechResult }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const previousDataRef = useRef<number[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimestampRef = useRef<number>(Date.now());
  const volumeThresholdRef = useRef<number>(35);
  const transcriptBufferRef = useRef<string[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Set language explicitly
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        isProcessingRef.current = true;
        transcriptBufferRef.current = [];
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            transcriptBufferRef.current.push(transcript.trim());
          } else {
            interimTranscript += transcript;
          }
        }

        // Update current transcript with both final and interim results
        currentTranscriptRef.current = transcriptBufferRef.current.join(' ') + 
          (interimTranscript ? ' ' + interimTranscript : '');

        // Send the current state to the UI
        onSpeechResult(currentTranscriptRef.current);

        // Reset silence detection timer
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Only set up silence detection if we have content
        if (currentTranscriptRef.current.trim()) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (currentTranscriptRef.current.trim()) {
              // Finalize the transcript
              const finalText = currentTranscriptRef.current.trim();
              transcriptBufferRef.current = [];
              currentTranscriptRef.current = '';
              onSpeechResult(finalText);
            }
          }, 1500); // Reduced silence threshold to 1.5 seconds
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          // Restart recognition if no speech was detected
          if (isListening && recognitionRef.current && isProcessingRef.current) {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          }
        }
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        // Restart recognition if still listening
        if (isListening && recognitionRef.current && isProcessingRef.current) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      isProcessingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [onSpeechResult, isListening]);

  useEffect(() => {
    let audioContext: AudioContext | null = null;

    const initAudio = async () => {
      try {
        if (isListening) {
          if (recognitionRef.current) {
            isProcessingRef.current = true;
            recognitionRef.current.start();
          }

          audioContext = new AudioContext();
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          mediaStreamRef.current = stream;
          
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.7;
          analyser.minDecibels = -90;
          analyser.maxDecibels = -10;
          
          source.connect(analyser);
          analyserRef.current = analyser;
          
          startAnimation();
        } else {
          isProcessingRef.current = false;
          stopAnimation();
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          currentTranscriptRef.current = '';
          transcriptBufferRef.current = [];
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initAudio();

    return () => {
      isProcessingRef.current = false;
      stopAnimation();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  const detectSound = (data: Uint8Array) => {
    const average = data.reduce((sum, value) => sum + value, 0) / data.length;
    
    if (average > volumeThresholdRef.current) {
      lastSoundTimestampRef.current = Date.now();
      return true;
    }
    
    const silenceDuration = Date.now() - lastSoundTimestampRef.current;
    if (silenceDuration > 1500 && currentTranscriptRef.current.trim()) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = setTimeout(() => {
        if (currentTranscriptRef.current.trim()) {
          const finalText = currentTranscriptRef.current.trim();
          transcriptBufferRef.current = [];
          currentTranscriptRef.current = '';
          onSpeechResult(finalText);
        }
      }, 300);
    }
    
    return false;
  };

  const smoothData = (newData: Uint8Array): number[] => {
    const noiseFloor = volumeThresholdRef.current;
    const smoothingFactor = 0.8;
    
    if (previousDataRef.current.length === 0) {
      previousDataRef.current = Array.from(newData);
      return Array.from(newData).map(value => value < noiseFloor ? 0 : value);
    }

    const smoothedData = Array.from(newData).map((value, i) => {
      const cleanValue = value < noiseFloor ? 0 : value;
      return smoothingFactor * previousDataRef.current[i] + (1 - smoothingFactor) * cleanValue;
    });

    previousDataRef.current = smoothedData;
    return smoothedData;
  };

  const startAnimation = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const barWidth = canvas.width / (dataArray.length * 0.7);
    const baseHeight = canvas.height / 2;
    
    const animate = () => {
      if (!analyserRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyserRef.current.getByteFrequencyData(dataArray);

      detectSound(dataArray);

      const smoothedData = smoothData(dataArray);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.2)';
      ctx.lineWidth = 2;
      ctx.moveTo(0, baseHeight);
      ctx.lineTo(canvas.width, baseHeight);
      ctx.stroke();

      smoothedData.forEach((value, index) => {
        const percent = value / 256;
        const height = baseHeight * percent * 1.5;
        const x = index * (barWidth + 1);
        
        if (height > 1) {
          const gradient1 = ctx.createLinearGradient(x, baseHeight - height, x, baseHeight);
          gradient1.addColorStop(0, 'rgba(96, 165, 250, 0.1)');
          gradient1.addColorStop(1, 'rgba(96, 165, 250, 0.9)');
          
          ctx.fillStyle = gradient1;
          ctx.fillRect(x, baseHeight - height, barWidth, height);
          
          const gradient2 = ctx.createLinearGradient(x, baseHeight, x, baseHeight + height);
          gradient2.addColorStop(0, 'rgba(96, 165, 250, 0.9)');
          gradient2.addColorStop(1, 'rgba(96, 165, 250, 0.1)');
          
          ctx.fillStyle = gradient2;
          ctx.fillRect(x, baseHeight, barWidth, height);

          if (percent > 0.3) {
            ctx.shadowColor = '#60A5FA';
            ctx.shadowBlur = 20;
          } else {
            ctx.shadowBlur = 0;
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const baseHeight = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.2)';
      ctx.lineWidth = 2;
      ctx.moveTo(0, baseHeight);
      ctx.lineTo(canvas.width, baseHeight);
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-[100px] bg-gray-900 rounded-lg"
    />
  );
};

export default AudioWave;