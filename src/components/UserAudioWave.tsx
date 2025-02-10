"use client";
import React, { useEffect, useRef } from 'react';

interface UserAudioWaveProps {
  isUserSpeaking: boolean;
}

const UserAudioWave: React.FC<UserAudioWaveProps> = ({ isUserSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isUserSpeaking) {
      initAudio();
    } else {
      stopAnimation();
    }

    return () => stopAnimation();
  }, [isUserSpeaking]);

  const initAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);
      analyserRef.current = analyser;

      console.log('Audio initialized successfully');
      startAnimation();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startAnimation = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const animate = () => {
      if (!analyserRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyserRef.current.getByteFrequencyData(dataArray);

      const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const speedFactor = Math.min(Math.max(volume / 100, 0.5), 2); // Adjust speed based on volume

      console.log('Volume:', volume, 'Speed Factor:', speedFactor); // Debugging

      const ripples = [
        { radius: 20, opacity: 1 },
        { radius: 40, opacity: 0.6 },
        { radius: 60, opacity: 0.3 },
      ];

      ripples.forEach((ripple) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(96, 165, 250, ${ripple.opacity})`;
        ctx.lineWidth = 4;
        ctx.stroke();

        ripple.radius += speedFactor; // Adjust radius increment based on speed factor
        ripple.opacity -= 0.01;

        if (ripple.opacity <= 0) {
          ripple.radius = 20;
          ripple.opacity = 1;
        }
      });

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(96, 165, 250, 0.8)";
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.9)",
      }}
    />
  );
};

export default UserAudioWave;
