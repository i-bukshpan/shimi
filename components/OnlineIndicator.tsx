"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function OnlineIndicator() {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const room = supabase.channel('online-users');
    let userId = localStorage.getItem('shimi_device_id');
    if (!userId) {
       userId = crypto.randomUUID();
       localStorage.setItem('shimi_device_id', userId);
    }

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({
            online_at: new Date().toISOString(),
            user: userId,
          });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, []);

  return (
    <div className="absolute top-6 left-6 z-30 pointer-events-none flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/90 shadow-sm px-3 py-1.5 rounded-full border border-emerald-200 backdrop-blur-md">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
      {onlineCount} מחוברים עכשיו
    </div>
  );
}
