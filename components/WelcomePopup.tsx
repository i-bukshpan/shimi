"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedName = localStorage.getItem("shimi_author_name");
    if (!savedName) {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      localStorage.setItem("shimi_author_name", name.trim());
      setIsOpen(false);
      window.dispatchEvent(new Event("author-name-updated"));
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center"
            dir="rtl"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            
            <h2 className="text-3xl font-black text-stone-800 mb-2">ברוכים הבאים! 🎉</h2>
            <p className="text-stone-500 mb-8 leading-relaxed">
              לפני שמתחילים לחגוג ולברך את שימי,<br/>איך קוראים לכם?
            </p>

            <input
              type="text"
              placeholder="שם (לדוגמה: דודה שרה)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full border-2 border-stone-200 rounded-2xl px-6 py-4 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all font-bold text-xl text-stone-800 text-center mb-6"
              autoFocus
            />

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <span>להיכנס למסיבה</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
