"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export type AICreation = {
  id: string;
  created_at: string;
  author: string;
  raw_blessing: string;
  generated_media_url: string | null;
  media_type: "image" | "audio" | "video" | "text";
  reactions: Record<string, number>;
  parent_id: string | null;
};

export default function LiveFeed() {
  const [creations, setCreations] = useState<AICreation[]>([]);

  useEffect(() => {
    // Fetch initial data
    const fetchCreations = async () => {
      const { data, error } = await supabase
        .from("ai_creations")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setCreations(data);
      }
    };

    fetchCreations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("live-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "shimi_birthday", table: "ai_creations" },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCreations((prev) => [payload.new as AICreation, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setCreations((prev) => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setCreations((prev) => prev.map(c => c.id === payload.new.id ? payload.new as AICreation : c));
          }
        }
      )
      .subscribe();

    // Fallback: Poll every 5 seconds
    const intervalId = setInterval(() => {
      fetchCreations();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const topLevelCreations = creations.filter(c => !c.parent_id);

  if (topLevelCreations.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white/50 rounded-2xl border-2 border-dashed border-stone-300">
        <p className="text-stone-500 font-medium">עדיין אין יצירות... תהיו הראשונים!</p>
      </div>
    );
  }

  const renderMedia = (creation: AICreation) => {
    if (creation.media_type === 'image' && creation.generated_media_url) {
      return <img src={creation.generated_media_url} alt="AI Generation" className="w-full h-auto object-cover rounded-sm" />;
    }
    if (creation.media_type === 'video' && creation.generated_media_url) {
      return <video src={creation.generated_media_url} controls className="w-full h-auto object-cover rounded-sm" />;
    }
    if (creation.media_type === 'audio') {
      return (
        <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col items-center justify-center gap-4 mt-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-2xl">🎵</span>
          </div>
          {creation.generated_media_url ? (
            <audio src={creation.generated_media_url} controls className="w-full" />
          ) : (
            <div className="animate-pulse w-full h-10 bg-white/50 rounded-full flex items-center justify-center">
              <p className="text-purple-400 text-sm font-medium">מייצר מנגינה קסומה...</p>
            </div>
          )}
        </div>
      );
    }
    if (creation.media_type !== 'text' && !creation.generated_media_url) {
      return (
        <div className="w-full bg-stone-100 rounded-sm overflow-hidden flex items-center justify-center aspect-square animate-pulse">
           <p className="text-stone-400 text-sm">מייצר...</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="columns-1 sm:columns-2 gap-6 w-full space-y-6">
      <AnimatePresence>
        {topLevelCreations.map((creation, index) => {
          const replies = creations.filter(c => c.parent_id === creation.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          return (
            <motion.div
              key={creation.id}
              initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -2 : 2 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -2 : 2 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-4 pb-6 rounded-sm shadow-xl border border-stone-100 flex flex-col gap-4 relative break-inside-avoid"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              }}
            >
              {/* Pin visual */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500 z-10" />

              {/* Media Area */}
              {renderMedia(creation)}

              {/* Content Area */}
              <div className="flex flex-col gap-1 mt-2">
                <p className="font-bold text-lg text-stone-800">{creation.author}</p>
                <p className={`text-stone-700 leading-relaxed ${creation.media_type === 'text' ? 'text-xl font-medium text-center py-4 text-stone-800' : ''}`}>
                  {creation.raw_blessing}
                </p>
              </div>
              
              {/* Replies Section */}
              {replies.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <h4 className="text-sm font-bold text-stone-500 mb-1 border-b border-stone-200 pb-1">תגובות ({replies.length}):</h4>
                  {replies.map(reply => (
                    <div key={reply.id} className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-sm border border-stone-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                          {reply.author.charAt(0)}
                        </div>
                        <p className="font-bold text-sm text-stone-800">{reply.author}</p>
                      </div>
                      <p className="text-sm text-stone-700">{reply.raw_blessing}</p>
                      {reply.media_type !== 'text' && (
                        <div className="mt-1 w-full max-w-[200px]">
                          {renderMedia(reply)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex justify-start mt-2 border-t border-stone-100 pt-3">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-uploader', { detail: { parentId: creation.id } }))}
                  className="text-sm text-stone-500 hover:text-rose-500 transition-colors flex items-center gap-1 font-bold bg-rose-50 px-3 py-1.5 rounded-full"
                >
                  <span>💬</span> כתיבת תגובה
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
