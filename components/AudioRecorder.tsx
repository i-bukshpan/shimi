'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("לא הצלחנו לגשת למיקרופון. אנא וודא שיש הרשאות לדפדפן.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    onRecordingComplete(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-stone-300 rounded-sm bg-[#FDFBF7] w-full">
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="flex flex-col items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
        >
          <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-full flex items-center justify-center shadow-inner hover:shadow-sm transition-shadow">
            <Mic className="w-8 h-8" />
          </div>
          <span className="font-semibold text-sm">הקלט ברכה קולית ישירות מכאן</span>
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-red-600 transition-colors"
            onClick={stopRecording}
          >
            <Square className="w-8 h-8 fill-current" />
          </motion.div>
          <div className="text-red-600 font-bold text-2xl font-mono bg-white px-4 py-1 rounded-full shadow-sm">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-red-500 font-semibold animate-pulse">מקליט... לחץ לעצירה</p>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center gap-4 w-full bg-white p-3 rounded-sm border border-stone-200 shadow-sm flex-col sm:flex-row">
          <audio src={audioUrl} controls className="w-full sm:flex-1 h-12" />
          <button
            type="button"
            onClick={deleteRecording}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            מחק הקלטה
          </button>
        </div>
      )}
    </div>
  );
}
