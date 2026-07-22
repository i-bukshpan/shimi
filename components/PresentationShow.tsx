"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { X } from 'lucide-react';

export default function PresentationShow({ nodes, edges, onExit }: { nodes: Node[], edges: Edge[], onExit: () => void }) {
  const { setCenter, fitView } = useReactFlow();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simple traversal path: follow edges or just array order if disconnected
  // A production app would build a directed graph traversal.
  // For now, we'll just visit each node in the array order for demonstration,
  // but prioritize targets of the current node if they exist.

  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05;
    }
  }, []);
  const [path, setPath] = useState<Node[]>([]);

  useEffect(() => {
    // Build a simple path: Start with the first node, follow edges if possible.
    if (nodes.length === 0) return;

    const visited = new Set<string>();
    const newPath: Node[] = [];
    
    // Starting node (find a root node - no incoming edges, or just the first one)
    let current = nodes.find(n => !edges.some(e => e.target === n.id)) || nodes[0];
    
    while (current && !visited.has(current.id)) {
      newPath.push(current);
      visited.add(current.id);
      
      // Find next connected node
      const outEdges = edges.filter(e => e.source === current.id);
      if (outEdges.length > 0) {
        const nextId = outEdges[0].target;
        current = nodes.find(n => n.id === nextId) || null as any;
      } else {
        // Find any unvisited node
        current = nodes.find(n => !visited.has(n.id)) || null as any;
      }
    }
    
    setPath(newPath);
  }, [nodes, edges]);

  useEffect(() => {
    if (path.length === 0) return;

    let timeout: NodeJS.Timeout;

    const showNext = () => {
      if (currentIndex >= path.length) {
        // End of presentation
        fitView({ duration: 1500 });
        setTimeout(onExit, 2000);
        return;
      }

      const node = path[currentIndex];
      
      // Fly to node
      setCenter(node.position.x + 150, node.position.y + 100, { zoom: 1.2, duration: 1500 });

      // If the node has TTS or audio, we would play it here
      const creation = node.data.creation as any;
      const audioUrl = creation.tts_media_url || (creation.media_type === 'audio' ? creation.generated_media_url : null);
      
      let duration = 4000; // default 4 seconds per slide

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Audio play blocked", e));
        
        // Wait for audio to finish before moving to next
        audio.onended = () => {
          setCurrentIndex(prev => prev + 1);
        };
      } else {
        timeout = setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, duration);
      }
    };

    // Small delay before starting
    timeout = setTimeout(showNext, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentIndex, path, setCenter, fitView, onExit]);

  return (
    <div className="absolute top-4 right-4 z-50">
      <button 
        onClick={onExit}
        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-xl flex items-center gap-2"
      >
        <X className="w-5 h-5" /> יציאה ממצב מצגת
      </button>
      
      {/* Background Music Player */}
      <audio 
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-birthday-113974.mp3" 
        autoPlay 
        loop 
      />
    </div>
  );
}
