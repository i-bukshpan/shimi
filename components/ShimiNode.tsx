import React, { memo } from 'react';

export default memo(function ShimiNode() {
  return (
    <div className="flex flex-col items-center pointer-events-auto relative !z-[9999]" dir="rtl">
      
      <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300 mt-2">
        <img 
          src="/profile.jpg" 
          alt="Shimi" 
          className="relative w-80 h-80 rounded-full object-cover border-4 border-amber-300 bg-white"
        />
      </div>
      <h1 className="mt-6 text-7xl font-black text-black tracking-wider whitespace-nowrap">
        מזל טוב שימי!
      </h1>
      
    </div>
  );
});
