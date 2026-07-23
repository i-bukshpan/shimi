"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Heart, Image as ImageIcon, Video, Mic, Sparkles } from "lucide-react";

export default function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[90px] left-4 sm:bottom-auto sm:top-[80px] sm:left-6 z-[40] bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-white flex items-center gap-2 animate-bounce"
        title="מה עושים כאן?"
      >
        <Info className="w-5 h-5" />
        <span className="font-bold text-sm">מה עושים פה?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#FAF6F0] rounded-3xl shadow-2xl p-8 flex flex-col relative max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 p-2 text-stone-500 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-stone-800">על המיזם שלנו</h2>
              </div>

              <div className="space-y-6 text-stone-600 leading-relaxed text-lg">
                <p>
                  <strong className="text-stone-800">המטרה שלנו פשוטה ומרגשת:</strong> לשמח את שימי האהוב שלנו לקראת יום ההולדת ה-9 שלו! 🎉
                </p>
                <p>
                  הקמנו את הלוח הזה כדי לאסוף ברכות, תמונות, סרטונים והקלטות קוליות מכל הדודים, הדודות ובני הדודים.
                </p>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 space-y-4">
                  <h3 className="font-bold text-stone-800">איך אפשר להשתתף?</h3>
                  
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-6 h-6 text-rose-500 shrink-0" />
                    <p className="text-sm"><strong>להעלות תמונות מרגשות:</strong> זיכרונות יפים שיש לכם יחד עם שימי.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Video className="w-6 h-6 text-indigo-500 shrink-0" />
                    <p className="text-sm"><strong>לצלם סרטוני ברכה:</strong> לברך אותו באופן אישי עם המון חום ואהבה.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mic className="w-6 h-6 text-emerald-500 shrink-0" />
                    <p className="text-sm"><strong>להקליט ברכה קולית:</strong> לפעמים הקול אומר הכל.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
                    <p className="text-sm"><strong>להיעזר ב"ברכה בAI":</strong> אם חסרות לכם מילים, העוזר החכם שלנו ישמח לכתוב לכם ברכה מדהימה ואפילו לייצר תמונות או שירים!</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-stone-800 text-white p-4 rounded-2xl">
                  <Heart className="w-8 h-8 text-rose-400 shrink-0" />
                  <p className="text-sm font-medium">
                    כל החומרים שייאספו כאן יהפכו למצגת או סרטון מיוחדים שיוצגו לשימי בהמשך, כהפתעה שתיתן לו המון כוח ושמחה!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-8 w-full bg-stone-200 text-stone-800 font-bold text-lg py-4 rounded-2xl hover:bg-stone-300 transition-colors"
              >
                הבנתי, בואו נתחיל!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
