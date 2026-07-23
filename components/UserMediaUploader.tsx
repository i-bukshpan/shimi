"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, Mic, Upload, X, Loader2, ImagePlus, Square, CheckCircle2, Sparkles } from "lucide-react";

export default function UserMediaUploader({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "text" | "">("");
  
  const [authorName, setAuthorName] = useState("");
  const [blessingText, setBlessingText] = useState("");
  const [decoration, setDecoration] = useState<string>("none");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isNikkuding, setIsNikkuding] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved author name
    setAuthorName(localStorage.getItem("shimi_author_name") || "");
    const handleNameUpdate = () => setAuthorName(localStorage.getItem("shimi_author_name") || "");
    window.addEventListener("author-name-updated", handleNameUpdate);

    // Listen for custom event to open uploader (e.g. for replying)
    const handleOpenUploader = (e: CustomEvent) => {
      if (e.detail?.parentId) {
        setParentId(e.detail.parentId);
      } else {
        setParentId(null);
      }
      if (!inline) setIsOpen(true);
    };

    window.addEventListener("open-uploader" as any, handleOpenUploader);
    return () => {
      window.removeEventListener("open-uploader" as any, handleOpenUploader);
      window.removeEventListener("author-name-updated", handleNameUpdate);
    };
  }, [inline]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMediaType(type);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) setMediaType("image");
      else if (selectedFile.type.startsWith("video/")) setMediaType("video");
      else if (selectedFile.type.startsWith("audio/")) setMediaType("audio");
      else setMediaType("image"); // fallback
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        setFile(audioFile);
        setMediaType("audio");
        setPreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("לא ניתן לגשת למיקרופון. אנא אשרו הרשאות.");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl("");
    setMediaType("");
    setBlessingText("");
    setSuccess(false);
    setParentId(null);
    setDecoration("none");
    if (isRecording) stopAudioRecording();
  };

  const handleUpload = async () => {
    if (!authorName.trim()) {
      alert("נא להזין את שמכם");
      return;
    }

    if (!file && !blessingText.trim()) {
      alert("נא לכתוב ברכה או לבחור קובץ להעלאה");
      return;
    }

    localStorage.setItem("shimi_author_name", authorName);
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("mediaType", mediaType || "text");
      formData.append("authorName", authorName);
      formData.append("blessingText", blessingText);
      formData.append("decoration", decoration);
      if (parentId) formData.append("parentId", parentId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert(`שגיאה בהעלאה: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNikud = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!blessingText.trim()) return;
    setIsNikkuding(true);
    try {
      const res = await fetch("/api/nikud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: blessingText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) setBlessingText(data.text);
      }
    } catch (err) {
      console.error("Nikud failed", err);
    } finally {
      setIsNikkuding(false);
    }
  };

  // Make it always "open" if inline
  const isVisible = inline || isOpen;

  // Render content
  const content = (
    <div className={`bg-white shadow-2xl overflow-hidden relative flex flex-col ${inline ? 'w-full h-full' : 'rounded-3xl w-full max-w-md max-h-[90vh]'}`}>
      {/* Header (Only for close button when floating) */}
      {!inline && (
        <div className="absolute top-3 left-3 z-10">
          <button 
            onClick={() => { setIsOpen(false); resetState(); }}
            className="p-1.5 text-stone-500 bg-white/80 backdrop-blur-md hover:bg-stone-100 rounded-full transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Body */}
      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 mb-4">
              <CheckCircle2 className="w-20 h-20" />
            </motion.div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">איזה יופי!</h3>
            <p className="text-stone-600">היצירה שלך עלתה בהצלחה ללוח החגיגות שלנו.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="relative flex-1 flex flex-col min-h-[120px]">
                <textarea
                  placeholder="כתבו כאן את הברכה שלכם..."
                  value={blessingText}
                  onChange={(e) => setBlessingText(e.target.value)}
                  className="w-full h-full border-2 border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all resize-none flex-1 text-lg text-stone-800 shadow-inner"
                  dir="rtl"
                />
                {blessingText.trim().length > 0 && (
                  <button 
                    onClick={handleNikud} 
                    disabled={isNikkuding}
                    className="absolute bottom-3 left-3 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    title="ניקוד אוטומטי"
                  >
                    {isNikkuding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
                    נקד
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-sm font-bold text-stone-600 px-1">קישוט מסביב לברכה:</label>
                <select 
                  value={decoration}
                  onChange={(e) => setDecoration(e.target.value)}
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all text-stone-800 font-medium"
                  dir="rtl"
                >
                  <option value="none">ללא</option>
                  <option value="balloons">בלונים מעופפים 🎈</option>
                  <option value="candles">נרות מהבהבים 🕯️</option>
                  <option value="confetti">קונפטי לחצן 🎉</option>
                  <option value="cake">עוגת יום הולדת 🎂</option>
                </select>
              </div>
            </div>

            {/* Media selection buttons */}
            <div className="shrink-0 flex flex-col gap-4">
              {!file ? (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input type="file" accept="image/*" capture="environment" ref={photoInputRef} onChange={(e) => handleFileChange(e, "image")} className="hidden" />
                  <button onClick={() => photoInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 bg-rose-50 text-rose-600 p-4 rounded-2xl hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm">
                    <Camera className="w-7 h-7" />
                    <span className="font-bold text-sm">צלם תמונה</span>
                  </button>

                  <input type="file" accept="video/*" capture="environment" ref={videoInputRef} onChange={(e) => handleFileChange(e, "video")} className="hidden" />
                  <button onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 bg-indigo-50 text-indigo-600 p-4 rounded-2xl hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm">
                    <Video className="w-7 h-7" />
                    <span className="font-bold text-sm">צלם סרטון</span>
                  </button>

                  <button 
                    onClick={isRecording ? stopAudioRecording : startAudioRecording} 
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-colors border shadow-sm ${isRecording ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                  >
                    {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-7 h-7" />}
                    <span className="font-bold text-sm">{isRecording ? formatTime(recordingTime) : "הקלט קול"}</span>
                  </button>

                  <input type="file" accept="image/*,video/*,audio/*" ref={fileInputRef} onChange={handleGalleryChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 bg-stone-50 text-stone-600 p-4 rounded-2xl hover:bg-stone-100 transition-colors border border-stone-200 shadow-sm">
                    <Upload className="w-7 h-7" />
                    <span className="font-bold text-sm">העלה קובץ</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  {mediaType === "image" && <img src={previewUrl} className="w-full max-h-48 object-contain rounded-xl bg-black/5" />}
                  {mediaType === "video" && <video src={previewUrl} controls className="w-full max-h-48 rounded-xl bg-black/5" />}
                  {mediaType === "audio" && <audio src={previewUrl} controls className="w-full" />}
                  
                  <button onClick={() => { setFile(null); setPreviewUrl(""); setMediaType(""); }} disabled={isUploading} className="w-full bg-white border border-stone-300 text-stone-600 py-2 rounded-xl font-bold hover:bg-stone-100 transition-colors shadow-sm">
                    הסר קובץ מצורף
                  </button>
                </div>
              )}

              {/* ALWAYS SHOW SUBMIT BUTTON */}
              <div className="mt-2 pb-2">
                <button 
                  onClick={handleUpload} 
                  disabled={isUploading || !authorName || (!file && !blessingText.trim())} 
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "שגר ללוח הברכות!"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
