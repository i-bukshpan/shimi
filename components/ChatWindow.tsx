"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
  ctas?: {
    action: string;
    media_type: "image" | "audio" | "video" | "text";
    prompt: string;
    clean_blessing?: string;
  }[];
  replyContextPreview?: {
    author: string;
    raw_blessing: string;
    media_type: string;
    url: string;
  };
};

export default function ChatWindow({ inline = false }: { inline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "bot",
      content: "היי! ברוכים הבאים למסיבה של שימי! 🎉 אני העוזר האישי שלכם כאן לאלבום הברכות.\nכדי שנוכל להתחיל, איך קוראים לכם ואיך אתם קשורים לשימי? \n\nאם בא לכם כיוון, תוכלו לבחור:\n1️⃣ ברכה קצרה ומרגשת (מרפואה ועד נחת)\n2️⃣ סיפור מצחיק או בדיחה משפחתית\n3️⃣ איחול של גיבור-על חזק ומנצח!\n\n(או פשוט תכתבו לי מה שבא לכם בתיבה למטה👇)"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [replyContext, setReplyContext] = useState<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleReply = (e: any) => {
      const creation = e.detail;
      setIsOpen(true);
      setReplyContext(creation);
      // focus input if possible
      setTimeout(() => (fileInputRef.current?.nextElementSibling as HTMLElement)?.focus(), 100);
    };
    window.addEventListener('reply-to-creation', handleReply);
    return () => window.removeEventListener('reply-to-creation', handleReply);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    // allow sending if there is text OR an attached file
    if ((!input.trim() && !attachedFile) || !authorName.trim()) return;
    if (input.length > 500) {
      alert("הברכה קצת ארוכה מדי... אנא קצרו אותה ל-500 תווים (:");
      return;
    }

    let finalContent = input || "הנה קובץ עבורך!";
    if (replyContext) {
      finalContent = `[הקשר פנימי לעוזר: המשתמש מגיב ליצירה הקודמת של ${replyContext.author}. 
הברכה המקורית של ${replyContext.author} הייתה: "${replyContext.raw_blessing}".
סוג היצירה: ${replyContext.media_type}.
קישור לקובץ של היצירה: ${replyContext.generated_media_url || 'אין'}. 
אנא התייחס לתוכן היצירה הזו ולברכה בתגובתך!]

הודעת המשתמש החדשה: ${input}`;
    }

    let userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: finalContent,
      replyContextPreview: replyContext ? {
        author: replyContext.author,
        raw_blessing: replyContext.raw_blessing,
        media_type: replyContext.media_type,
        url: replyContext.generated_media_url
      } : undefined
    };

    if (attachedFile && attachedFileBase64) {
      const base64Data = attachedFileBase64.split(",")[1];
      userMessage.inlineData = {
        mimeType: attachedFile.type,
        data: base64Data
      };
    }

    // For display purposes, we don't want to show the giant context block to the user in the UI.
    const displayMessage: Message = { ...userMessage, content: input || "הנה קובץ עבורך!" };
    
    setMessages((prev) => [...prev, displayMessage]);
    
    setInput("");
    setAttachedFile(null);
    setAttachedFileBase64("");
    setReplyContext(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          // ensure we pass inlineData properly
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content,
            inlineData: m.inlineData
          })),
          authorName
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: data.reply || "תקלה קטנה, בבקשה נסו שוב.",
          ctas: data.ctas || (data.cta ? [data.cta] : undefined),
        },
      ]);
    } catch (error) {
      console.error("Failed to chat", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMedia = async (cta: NonNullable<Message['ctas']>[0], botMessageText: string) => {
    if (!authorName.trim()) {
      alert("אנא הזינו את שמכם בתיבה למעלה לפני שניצור את היצירה!");
      return;
    }

    setIsGeneratingMedia(true);
    
    try {
      // Endpoint to generate media and save to supabase
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cta.prompt,
          mediaType: cta.media_type,
          authorName,
          blessingText: cta.clean_blessing || botMessageText,
          parentId: replyContext?.id
        })
      });
      
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "bot",
          content: "היצירה נשלחה בהצלחה ללוח שלנו! תסתכלו איזה יופי זה יצא 🎉"
        }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  return (
    <>
      {/* Global Floating Button - Only show if NOT inline */}
      {!inline && (
        <AnimatePresence>
          {!isOpen && (
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform border-4 border-white"
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="font-bold text-lg hidden sm:block">יצירת ברכה באלבום</span>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Chat Window Wrapper */}
      <AnimatePresence>
        {(isOpen || inline) && (
          <motion.div 
            initial={inline ? undefined : { opacity: 0, y: 50, scale: 0.95 }}
            animate={inline ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={inline ? undefined : { opacity: 0, y: 50, scale: 0.95 }}
            className={inline 
              ? "flex flex-col bg-transparent h-full w-full overflow-hidden" 
              : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col bg-[#FCF8F2] rounded-2xl shadow-2xl border border-[#ECC94B]/30 h-[80vh] max-h-[700px] w-[calc(100%-32px)] sm:w-[450px] overflow-hidden"
            }
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-xl text-amber-900 flex items-center gap-2 drop-shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
                העוזר למסיבה
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="שם (דודה שרה)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="text-sm border border-amber-300 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 w-32 shadow-inner"
                />
                {!inline && (
                  <button onClick={() => setIsOpen(false)} className="p-1.5 text-amber-900 bg-amber-200/50 hover:bg-amber-300 rounded-md transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF6F0]/50 pb-32">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-stone-800 text-stone-100 rounded-tr-sm"
                      : "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"
                  }`}
                >
                  {msg.replyContextPreview && (
                    <div className="mb-3 bg-stone-700/50 p-2 rounded-lg border border-stone-600/50 flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-300 font-bold mb-1">מגיב ל{msg.replyContextPreview.author}:</p>
                        <p className="text-xs text-stone-400 truncate">"{msg.replyContextPreview.raw_blessing}"</p>
                      </div>
                      {msg.replyContextPreview.url && (
                        msg.replyContextPreview.media_type === "image" ? (
                          <img src={msg.replyContextPreview.url} className="w-12 h-12 object-cover rounded-md" alt="Preview" />
                        ) : msg.replyContextPreview.media_type === "audio" ? (
                          <div className="w-12 h-12 bg-stone-600 rounded-md flex items-center justify-center">🎵</div>
                        ) : null
                      )}
                    </div>
                  )}

                  {msg.inlineData && msg.inlineData.mimeType.startsWith("image/") && (
                    <img src={`data:${msg.inlineData.mimeType};base64,${msg.inlineData.data}`} className="w-48 rounded-lg mb-3 object-cover shadow-sm" alt="attachment" />
                  )}
                  {msg.inlineData && msg.inlineData.mimeType.startsWith("audio/") && (
                    <audio src={`data:${msg.inlineData.mimeType};base64,${msg.inlineData.data}`} controls className="w-48 mb-3" />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.ctas && msg.ctas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-200/50 flex flex-col gap-2">
                      <p className="text-sm text-stone-500 font-medium">מה תרצו שאעשה עכשיו?</p>
                      <div className="flex flex-col gap-2">
                        {msg.ctas.map((cta, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleGenerateMedia(cta, msg.content)}
                            disabled={isGeneratingMedia}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-xl font-bold hover:shadow-md transition-all active:scale-95 disabled:opacity-50 w-full text-sm"
                          >
                            {isGeneratingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {cta.action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex items-end justify-start opacity-60">
              <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-sm">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 flex flex-col gap-2 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          {/* Reply Context Preview */}
          {replyContext && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-lg mb-1">
              <span className="text-xs text-amber-800 truncate">
                <strong>מגיב ל{replyContext.author}:</strong> "{replyContext.raw_blessing}"
              </span>
              <button onClick={() => setReplyContext(null)} className="p-1 hover:bg-amber-200 rounded-full text-amber-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Attachment Preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-2 rounded-lg self-start">
              <span className="text-xs text-stone-600 max-w-[150px] truncate">{attachedFile.name}</span>
              <button onClick={() => { setAttachedFile(null); setAttachedFileBase64(""); }} className="p-1 hover:bg-stone-200 rounded-full text-stone-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-stone-100 text-stone-600 p-3 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={authorName ? "כתבו כאן את הברכה או הסיפור..." : "אנא הזינו שם למעלה קודם..."}
              disabled={!authorName || isLoading}
              className="flex-1 bg-stone-100 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 resize-none h-[48px] max-h-[120px]"
              dir="rtl"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || !authorName || isLoading}
              className="bg-stone-800 text-white p-3 rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-end">
            <span className={`text-xs ${input.length > 500 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
              {input.length}/500
            </span>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
