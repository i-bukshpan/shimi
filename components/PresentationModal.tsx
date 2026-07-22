"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PresentationModal({ nodes, edges, onExit }: { nodes: Node[], edges: Edge[], onExit: () => void }) {
  const { setCenter, fitView } = useReactFlow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [path, setPath] = useState<Node[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement>(null);

  // DFS Traversal to respect Parent -> Child relationships
  useEffect(() => {
    if (nodes.length === 0) return;

    const visited = new Set<string>();
    const newPath: Node[] = [];
    
    const rootNode = nodes.find(n => n.id === 'shimi-main-node') || nodes[0];
    
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) newPath.push(node);
      
      const childrenEdges = edges.filter(e => e.source === nodeId);
      for (const edge of childrenEdges) {
        dfs(edge.target);
      }
    };

    dfs(rootNode.id);

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }
    
    setPath(newPath);
  }, [nodes, edges]);

  useEffect(() => {
    if (path.length === 0) return;

    let timeout: NodeJS.Timeout;
    let currentAudio: HTMLAudioElement | null = null;

    const showNext = () => {
      setActiveImage(null); // Clear any active image
      if (currentIndex >= path.length) {
        // End of presentation
        fitView({ duration: 2500, padding: 0.2 });
        if (bgMusicRef.current) {
          bgMusicRef.current.volume = 0.3;
        }
        setTimeout(onExit, 3000);
        return;
      }

      const node = path[currentIndex];
      const creation = node.data.creation as any;
      const isParent = !creation?.parent_id;
      const isImage = creation?.media_type === 'image';
      const audioUrl = creation?.tts_media_url || (creation?.media_type === 'audio' ? creation.generated_media_url : null);
      
      // Dynamic Camera Work
      if (currentIndex % 4 === 0 && currentIndex !== 0 && !isImage) {
        // Every 4 slides, do a wide pan-out before diving in
        fitView({ duration: 1500, padding: 0.3 });
        setTimeout(() => {
          setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1.4, duration: 1500 });
        }, 1600);
      } else if (isImage) {
        // Focus normally for image, then trigger lightbox
        setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1.2, duration: 1200 });
        setTimeout(() => {
          setActiveImage(creation.generated_media_url || creation.user_media_url);
        }, 1300);
      } else if (!isParent && creation) {
        // Reply card - zoom in very close
        setCenter(node.position.x + 150, node.position.y + 80, { zoom: 1.8, duration: 1500 });
      } else {
        // Normal text/audio card
        setCenter(node.position.x + 120, node.position.y + 100, { zoom: 1.3, duration: 1500 });
      }

      let slideDuration = isImage ? 5000 : 4000;

      if (audioUrl) {
        currentAudio = new Audio(audioUrl);
        
        if (bgMusicRef.current) {
          bgMusicRef.current.volume = 0.05; // Audio Ducking
        }

        currentAudio.play().catch(e => console.error("Audio blocked", e));
        
        currentAudio.onended = () => {
          if (bgMusicRef.current) bgMusicRef.current.volume = 0.3;
          setActiveImage(null);
          timeout = setTimeout(() => setCurrentIndex(prev => prev + 1), 1000);
        };
      } else {
        timeout = setTimeout(() => {
          setActiveImage(null);
          setCurrentIndex(prev => prev + 1);
        }, slideDuration);
      }
    };

    timeout = setTimeout(showNext, 1500);

    return () => {
      clearTimeout(timeout);
      if (currentAudio) currentAudio.pause();
    };
  }, [currentIndex, path, setCenter, fitView, onExit]);

  const nextSlide = () => {
    setActiveImage(null);
    setCurrentIndex(prev => Math.min(prev + 1, path.length));
  };

  const prevSlide = () => {
    setActiveImage(null);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <>
      {/* HUD Overlay */}
      <div className="absolute top-6 right-6 z-[200] flex gap-4 pointer-events-auto">
        <div className="bg-[#FCF8F2]/90 backdrop-blur-md text-amber-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-[#ECC94B]/40">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">
            מצגת חגיגית מנגנת... ({currentIndex}/{path.length})
          </span>
          <div className="flex gap-2 ml-4 border-l border-[#ECC94B]/30 pl-4">
            <button onClick={prevSlide} className="hover:text-amber-500 transition-colors" title="הקודם">
              ◀
            </button>
            <button onClick={nextSlide} className="hover:text-amber-500 transition-colors" title="הבא">
              ▶
            </button>
          </div>
        </div>

        <button 
          onClick={onExit}
          className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
          title="יציאה ממצב מצגת"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lightbox for Images */}
      <AnimatePresence>
        {activeImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none p-12"
          >
            <div className="relative p-3 bg-white rounded-xl shadow-2xl border-4 border-[#ECC94B] rotate-[-2deg]">
              <img 
                src={activeImage} 
                className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg"
                alt="Presentation Image"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio 
        ref={bgMusicRef}
        src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-birthday-113974.mp3" 
        autoPlay 
        loop 
        volume={0.3} 
      />
    </>
  );
}
