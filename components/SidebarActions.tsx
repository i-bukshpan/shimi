"use client";

import React from 'react';

export default function SidebarActions() {
  return (
    <div className="p-4 bg-transparent border-t border-[#ECC94B]/20 flex flex-col gap-3">
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-uploader'))}
        className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <span>➕</span> הוספת ברכה ידנית
      </button>
      
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('play-presentation'))}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <span>▶️</span> נגן מצגת 
      </button>
    </div>
  );
}
