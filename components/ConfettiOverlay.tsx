"use client";

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true
    });

    const fire = () => {
      myConfetti({
        particleCount: 15,
        spread: 120,
        origin: { y: -0.1, x: Math.random() },
        colors: ['#FBBF24', '#F59E0B', '#D97706', '#FFFFFF', '#6366F1'],
        ticks: 400,
        gravity: 0.3,
        scalar: 0.8,
      });
    };

    const interval = setInterval(fire, 3000);
    fire();

    return () => clearInterval(interval);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40" 
    />
  );
}
