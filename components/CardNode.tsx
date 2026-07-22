"use client";

import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import confetti from 'canvas-confetti';
import { Play, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export default memo(function CardNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes } = useReactFlow();
  const c: any = data.creation;
  const likes: any[] = (data.likes as any[]) || [];
  const comments: any[] = (data.comments as any[]) || [];
  const decoration = c.decoration || 'none';

  const [deviceId, setDeviceId] = useState<string>('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let devId = localStorage.getItem('shimi_device_id');
    if (!devId) {
      devId = crypto.randomUUID();
      localStorage.setItem('shimi_device_id', devId);
    }
    setDeviceId(devId);
  }, []);

  // Fire confetti on mount if decoration is confetti
  useEffect(() => {
    if (decoration === 'confetti') {
      const timer = setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#ECC94B', '#F56565', '#4299E1'] });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [decoration]);

  const hasLiked = likes.some(l => l.device_id === deviceId);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        let newLikes = [...(n.data.likes as any[])];
        if (hasLiked) {
          newLikes = newLikes.filter(l => l.device_id !== deviceId);
        } else {
          newLikes.push({ id: 'temp-' + Date.now(), card_id: c.id, device_id: deviceId });
        }
        return { ...n, data: { ...n.data, likes: newLikes } };
      }
      return n;
    }));

    if (hasLiked) {
      const like = likes.find(l => l.device_id === deviceId);
      if (like && !like.id.startsWith('temp-')) {
        await supabase.from('card_likes').delete().eq('id', like.id);
      }
    } else {
      await supabase.from('card_likes').insert({
        card_id: c.id,
        device_id: deviceId
      });
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    
    const newComment = {
      id: 'temp-' + Date.now(),
      card_id: c.id,
      author: commentName.trim(),
      text: commentText.trim()
    };

    // Optimistic Update
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, comments: [...(n.data.comments as any[]), newComment] } };
      }
      return n;
    }));

    setShowCommentForm(false);
    setCommentText('');

    await supabase.from('card_comments').insert({
      card_id: c.id,
      author: newComment.author,
      text: newComment.text
    });
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  // Determine card border/shadow based on decoration
  let cardStyle = "border-amber-200 shadow-xl";
  if (decoration === 'cake') cardStyle = "border-pink-300 shadow-[0_10px_40px_rgba(244,114,182,0.3)]";
  if (decoration === 'candles') cardStyle = "border-orange-300 shadow-[0_0_30px_rgba(251,146,60,0.4)]";
  if (decoration === 'balloons') cardStyle = "border-sky-300 shadow-[0_10px_40px_rgba(56,189,248,0.2)]";
  if (decoration === 'confetti') cardStyle = "border-purple-300 shadow-[0_10px_40px_rgba(168,85,247,0.3)]";

  return (
    <div className="relative group transition-all duration-300 hover:scale-105 hover:-translate-y-2 z-10 hover:z-50">      
      {/* Rich Decorations */}
      {decoration === 'balloons' && (
        <div className="absolute -top-16 -left-10 w-24 h-32 pointer-events-none z-20 opacity-90 drop-shadow-lg flex gap-1">
          <div className="text-5xl animate-[bounce_3s_infinite_ease-in-out]">🎈</div>
          <div className="text-4xl animate-[bounce_2.5s_infinite_ease-in-out] mt-6">🎈</div>
          <div className="text-5xl animate-[bounce_3.5s_infinite_ease-in-out] -mt-2">🎈</div>
        </div>
      )}
      
      {decoration === 'candles' && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center gap-12 z-20 pointer-events-none drop-shadow-2xl">
          <div className="text-5xl animate-[pulse_1s_infinite]">🕯️</div>
          <div className="text-5xl animate-[pulse_1.2s_infinite]">🕯️</div>
        </div>
      )}

      {/* Main Card Container */}
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl border-4 ${cardStyle} p-5 w-80 text-right relative overflow-hidden flex flex-col pointer-events-auto`}
        dir="rtl"
        onMouseDown={(e) => {
           if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
             e.stopPropagation();
           }
        }}
      >
        
        {/* Media Rendering */}
        {c.media_type === 'image' && c.generated_media_url && (
          <div className="relative mb-4 rounded-xl overflow-hidden ring-4 ring-stone-100 shadow-inner bg-black/5 flex justify-center items-center">
            <img src={c.generated_media_url} alt="Creation" className="w-full max-h-[500px] object-contain" />
          </div>
        )}
        
        {c.media_type === 'video' && c.generated_media_url && (
          <div className="relative mb-4 rounded-xl overflow-hidden ring-4 ring-stone-100 shadow-inner bg-black">
            <video src={c.generated_media_url} className="w-full h-56 object-cover" controls />
          </div>
        )}

        {/* Audio buttons */}
        {c.media_type === 'audio' && c.generated_media_url && (
          <div className="flex gap-2 justify-end mb-3">
            <button onClick={() => playAudio(c.generated_media_url)} className="bg-gradient-to-r from-blue-400 to-indigo-500 p-2.5 rounded-full text-white shadow-md hover:scale-110 transition-transform" title="נגן הקלטה">
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}

        <div className="flex-1 mb-4">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-600 to-orange-500 mb-2">{c.author}</h3>
          {c.raw_blessing && c.raw_blessing.trim().length > 0 && (
            <p className="text-stone-700 font-medium leading-relaxed whitespace-pre-wrap bg-stone-50 p-3 rounded-xl border border-stone-100">{c.raw_blessing}</p>
          )}
        </div>

        {/* Interactions Toolbar */}
        <div className="flex flex-col gap-3 mt-auto border-t-2 border-stone-100 pt-3 text-stone-500">
          <div className="flex items-center justify-between">
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${hasLiked ? 'text-rose-500 bg-rose-50' : 'hover:bg-stone-100'}`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current scale-110' : ''} transition-transform`} />
              <span className="text-sm font-bold">{likes.length > 0 ? likes.length : 'לייק'}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCommentForm(!showCommentForm); }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${showCommentForm ? 'text-indigo-500 bg-indigo-50' : 'hover:bg-stone-100'}`}
            >
              <span className="text-sm font-bold">{comments.length > 0 ? comments.length : ''} תגובה מהירה</span>
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('open-uploader', { detail: { parentId: c.id } }));
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-2 rounded-lg font-bold shadow-md hover:scale-[1.02] transition-transform w-full"
          >
            <span>🚀 הוסף חוויה/תמונה מחוברת</span>
          </button>
        </div>

        {/* Comments List */}
        {comments.length > 0 && (
          <div className="mt-3 bg-stone-50/80 rounded-xl p-3 text-sm flex flex-col gap-2 max-h-40 overflow-y-auto pointer-events-auto border border-stone-200" onWheel={(e) => e.stopPropagation()}>
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-stone-200/60 last:border-0 pb-1.5 last:pb-0">
                <span className="font-extrabold text-stone-800 ml-1.5">{comment.author}:</span>
                <span className="text-stone-600">{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        {showCommentForm && (
          <form onSubmit={submitComment} className="mt-3 flex flex-col gap-2 pointer-events-auto bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <input 
              type="text" 
              placeholder="השם שלך..." 
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="text-sm p-2 border-2 border-white rounded-lg w-full nodrag outline-none focus:border-indigo-300 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="כתוב תגובה..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="text-sm p-2 border-2 border-white rounded-lg flex-1 nodrag outline-none focus:border-indigo-300 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              />
              <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 rounded-lg text-sm font-bold hover:opacity-90 shadow-sm transition-opacity">
                שלח
              </button>
            </div>
          </form>
        )}

        {/* Cake Footer Base */}
        {decoration === 'cake' && (
          <div className="w-full text-center mt-6 pt-4 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-pink-200 to-transparent -mx-5 -mb-5 h-16 opacity-30 rounded-b-xl" />
             <span className="text-6xl drop-shadow-xl relative z-10 animate-[bounce_2s_infinite]">🎂</span>
          </div>
        )}

        {/* Confetti Action Button */}
        {decoration === 'confetti' && (
           <button 
            onClick={(e) => { e.stopPropagation(); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }} 
            className="absolute top-3 left-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full p-2.5 shadow-lg hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50"
            title="הפעל קונפטי!"
           >
             🎉
           </button>
        )}
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!w-6 !h-6 !bg-[#FAF6F0] !border-4 !border-indigo-500 !z-50 transition-transform hover:scale-125 shadow-lg !rounded-full" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!w-6 !h-6 !bg-[#FAF6F0] !border-4 !border-pink-500 !z-50 transition-transform hover:scale-125 shadow-lg !rounded-full" />
    </div>
  );
});
