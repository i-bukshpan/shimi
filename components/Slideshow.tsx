"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PlayCircle, FileText, Volume2, VolumeX } from "lucide-react";

export default function Slideshow() {
  const [creations, setCreations] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentMediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCreations = async () => {
      const { data } = await supabase
        .from("ai_creations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (data) setCreations(data);
    };

    fetchCreations();

    const channel = supabase
      .channel("slideshow_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "shimi_birthday", table: "ai_creations" },
        (payload) => {
          setCreations((prev) => [payload.new, ...prev].slice(0, 15));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % creations.length);
  };

  useEffect(() => {
    if (!isOpen || creations.length === 0) {
      if (bgmRef.current) bgmRef.current.pause();
      window.speechSynthesis.cancel();
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (bgmRef.current && !isMuted) {
      bgmRef.current.volume = 0.2;
      bgmRef.current.play().catch(e => console.log("BGM play prevented", e));
    }

    const current = creations[currentIndex];
    let duration = 6000; // default 6s

    // Clean up previous TTS
    window.speechSynthesis.cancel();
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }

    if (!isMuted && current.raw_blessing && current.media_type !== "audio" && current.media_type !== "video") {
      const handleTtsEnd = () => {
        if (bgmRef.current && !isMuted) bgmRef.current.volume = 0.2;
        if (current.media_type === "image" || current.media_type === "text") {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(nextSlide, 2000);
        }
      };

      // Duck BGM
      if (bgmRef.current) bgmRef.current.volume = 0.05;

      if (current.tts_media_url) {
        const tts = new Audio(current.tts_media_url);
        ttsAudioRef.current = tts;
        tts.onended = handleTtsEnd;
        tts.play().catch(e => {
          console.error("TTS audio play failed, falling back to browser TTS", e);
          const utterance = new SpeechSynthesisUtterance(current.raw_blessing);
          utterance.lang = "he-IL";
          utterance.rate = 0.9;
          utterance.onend = handleTtsEnd;
          window.speechSynthesis.speak(utterance);
        });
      } else {
        const utterance = new SpeechSynthesisUtterance(current.raw_blessing);
        utterance.lang = "he-IL";
        utterance.rate = 0.9;
        utterance.onend = handleTtsEnd;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (current.media_type === "image" || current.media_type === "text") {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(nextSlide, duration);
      }
    }

    // For Audio/Video we wait for them to finish (they have onEnded events in the JSX)
    if (current.media_type === "audio" || current.media_type === "video") {
      if (bgmRef.current) bgmRef.current.pause(); // stop BGM while video/audio plays
      if (timerRef.current) clearTimeout(timerRef.current);
      // Fallback timeout in case media fails to load or play
      timerRef.current = setTimeout(nextSlide, 15000); 
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis.cancel();
      if (ttsAudioRef.current) ttsAudioRef.current.pause();
    };
  }, [currentIndex, isOpen, creations, isMuted]);

  const handleMediaEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(nextSlide, 1000);
  };

  if (creations.length === 0) return null;
  const current = creations[currentIndex];

  return (
    <>
      {/* Background Music Audio Element */}
      <audio ref={bgmRef} src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc6df0a3.mp3?filename=ambient-piano-amp-strings-10711.mp3" loop />

      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-stone-800 to-stone-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform border-4 border-white"
          >
            <PlayCircle className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-lg hidden sm:block text-amber-50">צפה במצגת</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Top Bar Controls */}
            <div className="absolute top-6 right-6 left-6 z-50 flex justify-between items-center pointer-events-none">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="pointer-events-auto text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all backdrop-blur-md"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                className="pointer-events-auto text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all backdrop-blur-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center w-full h-full"
              >
                {/* Moving Blurred Background */}
                {current.media_type === "image" && current.generated_media_url ? (
                  <motion.img 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    src={current.generated_media_url} 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl" 
                    alt="bg" 
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-stone-900 via-black to-stone-900 opacity-90" />
                )}
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 p-8 max-w-7xl w-full h-full md:h-auto justify-center">
                  
                  {/* Media Content */}
                  <div className="w-full md:w-1/2 flex justify-center items-center h-[40vh] md:h-[60vh]">
                    {current.media_type === "image" && current.generated_media_url ? (
                      <motion.img 
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.05 }}
                        transition={{ duration: 10, ease: "linear" }}
                        src={current.generated_media_url} 
                        className="w-full h-full object-contain md:object-cover rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10" 
                      />
                    ) : current.media_type === "video" && current.generated_media_url ? (
                      <video 
                        src={current.generated_media_url} 
                        autoPlay 
                        controls={false}
                        muted={isMuted}
                        onEnded={handleMediaEnd}
                        className="w-full h-full object-contain md:object-cover rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10" 
                      />
                    ) : current.media_type === "audio" && current.generated_media_url ? (
                      <div className="w-full max-w-[500px] aspect-square bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center justify-center text-white p-8 text-center border-4 border-indigo-500/30 relative overflow-hidden">
                         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                         <PlayCircle className="w-24 h-24 mb-6 text-indigo-300 relative z-10" />
                         <audio src={current.generated_media_url} autoPlay muted={isMuted} onEnded={handleMediaEnd} className="hidden" />
                      </div>
                    ) : (
                      <div className="w-full max-w-[500px] aspect-square bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-amber-200 p-8 text-center border-4 border-stone-700">
                         <FileText className="w-24 h-24 mb-6 opacity-50" />
                         <p className="font-bold text-3xl">ברכה מהלב</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-right">
                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-amber-400 font-bold text-2xl md:text-4xl mb-4 drop-shadow-md"
                    >
                      מאת: {current.author}
                    </motion.h3>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white text-2xl md:text-5xl font-serif leading-tight md:leading-snug drop-shadow-2xl" 
                      dir="rtl"
                    >
                      "{current.raw_blessing}"
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Progress indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20 px-8 flex-wrap">
              {creations.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
