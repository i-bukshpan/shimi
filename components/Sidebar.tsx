"use client";

import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import UserMediaUploader from './UserMediaUploader';
import { Play, Sparkles, X, MessageCircle } from 'lucide-react';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button (Floating) */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-3 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'hidden' : 'flex'} items-center justify-center gap-2`}
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="font-bold text-sm">פתח עוזר</span>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative top-0 bottom-0 right-0 z-50 
        w-[90vw] max-w-[400px] md:w-[350px] 
        h-[100dvh] bg-[#FCF8F2] border-l border-[#ECC94B]/30 shadow-[4px_0_24px_rgba(236,201,75,0.15)] 
        flex flex-col shrink-0 overflow-hidden transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header & Tabs */}
        <div className="bg-gradient-to-br from-[#FCF8F2] to-[#FAF6F0] border-b border-[#ECC94B]/20 shrink-0 shadow-sm flex flex-col">
          
          {/* Top Header Row with Title and Play Button */}
          <div className="p-4 pb-2 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="font-black text-xl text-amber-900 drop-shadow-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                יום הולדת 9 לשימי 🎉
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('play-presentation'))}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-transform hover:scale-105 flex items-center gap-1 border border-indigo-200"
                title="נגן מצגת קולנועית"
              >
                <Play className="w-3 h-3 fill-current" />
                מצגת
              </button>
              
              {/* Close button for mobile */}
              <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden bg-red-100 text-red-600 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Tabs Row */}
        <div className="flex px-4 pb-0 mt-2 gap-2">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-bold rounded-t-xl transition-colors border-t border-l border-r ${
              activeTab === 'ai' 
              ? 'bg-[#FAF6F0]/50 border-amber-300 text-amber-800' 
              : 'bg-transparent border-transparent text-amber-700/50 hover:bg-amber-50'
            }`}
          >
            ברכה בAI
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-sm font-bold rounded-t-xl transition-colors border-t border-l border-r ${
              activeTab === 'manual' 
              ? 'bg-[#FAF6F0]/50 border-amber-300 text-amber-800' 
              : 'bg-transparent border-transparent text-amber-700/50 hover:bg-amber-50'
            }`}
          >
            ברכה ידנית
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative bg-[#FAF6F0]/50">
        {activeTab === 'ai' ? (
          <ChatWindow inline />
        ) : (
          <UserMediaUploader inline />
        )}
        </div>
      </aside>
    </>
  );
}
