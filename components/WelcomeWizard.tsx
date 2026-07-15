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
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center flex flex-col justify-center items-center min-h-[80vh] sm:min-h-[auto] py-4 sm:py-12 px-2 space-y-6 sm:space-y-8"
          >
            <div className="flex justify-center mb-2 sm:mb-6">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden border-8 border-white shadow-2xl relative"
              >
                <Image 
                  src="/profile.jpg" 
                  alt="שימי" 
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 inline-block drop-shadow-sm leading-tight px-2">
              יום הולדת שמח לשימי! 🎈
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed px-2">
              הצטרפו אלינו לברך ולכתוב את סיפור יום ההולדת המשותף!
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-8 bg-gradient-to-r from-green-400 to-emerald-600 text-white px-10 py-5 rounded-full font-black text-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
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
            className="w-full pb-12"
          >
            <div className="text-center mb-8 relative">
               <button 
                onClick={() => setStep(1)} 
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-800 font-bold hidden md:block"
               >
                 ← חזור למסך הפתיחה
               </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">שלב הברכה</h2>
              <p className="text-gray-600">קראו את המשפט, הוסיפו אחד משלכם וצרפו ברכות ממשפחתכם.</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-3xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-2xl mx-auto mb-12">
              <div className="bg-white p-8 rounded-[22px] h-full flex flex-col justify-center text-center space-y-4">
                <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wider">המשפט הקודם בסיפור:</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                  "{randomSentence}"
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto border border-white/50">
              <BirthdayForm />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
