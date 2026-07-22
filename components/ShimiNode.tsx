import React, { memo } from 'react';

export default memo(function ShimiNode() {
  return (
    <div className="flex flex-col items-center pointer-events-auto relative !z-[9999]">
      
      <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300 mt-2">
        {/* Golden glowing frame */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img 
          src="/profile.jpg" 
          alt="Shimi" 
          className="relative w-32 h-32 rounded-full object-cover border-4 border-amber-300 shadow-2xl bg-white"
        />
      </div>
      <h1 className="mt-4 text-4xl font-black text-white tracking-wider drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        מזל טוב שימי!
      </h1>
      
    </div>
  );
});
