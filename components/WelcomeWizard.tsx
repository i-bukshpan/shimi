'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BirthdayForm from './BirthdayForm';
import Image from 'next/image';

interface WelcomeWizardProps {
  randomSentence: string;
}

export default function WelcomeWizard({ randomSentence }: WelcomeWizardProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="w-full text-slate-800">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center flex flex-col justify-center items-center min-h-[100dvh] sm:min-h-[auto] py-4 sm:py-16 px-4 space-y-4 sm:space-y-12"
          >
            {/* The Polaroid Frame */}
            <div className="relative group">
              {/* Washi Tape */}
              <div className="absolute -top-4 -right-8 w-24 h-8 bg-rose-200/90 backdrop-blur-sm -rotate-6 z-20 shadow-sm border border-white/40 mix-blend-multiply rounded-sm"></div>
              
              <motion.div 
                animate={{ rotate: [-2, 0, -2] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="w-44 h-56 sm:w-64 sm:h-80 bg-white p-2 sm:p-4 pb-12 sm:pb-20 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 rotate-2 relative z-10"
              >
                <div className="relative w-full h-full bg-gray-200 border border-gray-300/50 shadow-inner overflow-hidden">
                  <Image 
                    src="/profile.jpg" 
                    alt="שימי" 
                    fill
                    className="object-cover sepia-[0.1]"
                  />
                </div>
                {/* Hand-written text on Polaroid */}
                <p className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center font-bold text-gray-600 text-xl sm:text-2xl opacity-80 -rotate-2">
                  שימי - 2026!
                </p>
              </motion.div>
            </div>
            
            <div className="space-y-4 max-w-2xl relative">
              {/* Decorative corner element */}
              <div className="absolute -top-6 -left-6 text-amber-500/30 text-6xl rotate-12 pointer-events-none">✨</div>
              
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-800 drop-shadow-sm leading-tight px-2">
                יום הולדת שמח לשימי! 🎈
              </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-slate-600 font-medium leading-relaxed px-2">
                הצטרפו אלינו לברך ולכתוב את סיפור יום ההולדת המשותף!
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-4 bg-orange-400 text-orange-950 border-2 border-orange-600 px-4 sm:px-10 py-3 sm:py-5 rounded-sm font-black text-lg sm:text-2xl shadow-[4px_4px_0px_0px_rgba(194,65,12,1)] hover:shadow-[2px_2px_0px_0px_rgba(194,65,12,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-[90%] sm:w-auto mx-auto break-words"
            >
              המשך לכתיבת הברכה ✨
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pb-12 pt-4"
          >
            <div className="text-center mb-12 relative max-w-4xl mx-auto">
               <button 
                onClick={() => setStep(1)} 
                className="absolute right-4 top-0 text-slate-400 hover:text-slate-700 font-bold hidden md:block transition-colors"
               >
                 ← חזור למסך הפתיחה
               </button>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">שלב הברכה</h2>
              <p className="text-slate-600 text-lg">קראו את המשפט הקודם, והמשיכו את הסיפור שלנו...</p>
            </div>

            {/* The Post-it Note */}
            <div className="bg-[#FEF3C7] p-8 sm:p-10 shadow-md transform -rotate-2 hover:-rotate-1 transition-transform duration-300 max-w-2xl mx-auto mb-16 relative border border-[#FDE68A] group">
              {/* Pin at the top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full shadow-md border-2 border-red-600 z-10">
                <div className="absolute inset-1 bg-white/40 rounded-full shadow-inner"></div>
              </div>
              
              <div className="flex flex-col justify-center text-center space-y-5">
                <h3 className="text-sm font-bold text-amber-700/60 uppercase tracking-widest border-b border-amber-200 pb-2 inline-block mx-auto">המשפט הקודם בסיפור</h3>
                <p className="text-2xl md:text-3xl font-bold text-indigo-900/90 leading-relaxed font-serif">
                  "{randomSentence}"
                </p>
              </div>
              
              {/* Fold effect corner */}
              <div className="absolute bottom-0 right-0 border-l-[30px] border-t-[30px] border-l-transparent border-t-amber-100/50 shadow-sm"></div>
            </div>

            <div className="bg-white p-6 sm:p-10 shadow-lg max-w-2xl w-full mx-auto border border-stone-200 relative">
               {/* Tape on the form */}
               <div className="absolute -top-3 -left-4 w-20 h-6 bg-blue-100/80 backdrop-blur-sm rotate-3 z-20 shadow-sm border border-white/40 mix-blend-multiply"></div>
               <div className="absolute -bottom-3 -right-4 w-20 h-6 bg-blue-100/80 backdrop-blur-sm -rotate-3 z-20 shadow-sm border border-white/40 mix-blend-multiply"></div>

              <BirthdayForm />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
