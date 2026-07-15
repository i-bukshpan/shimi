'use client';
import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, User, Type, UploadCloud, Camera, PlusCircle, Users, X } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

interface FamilyGreeting {
  id: string;
  name: string;
  text_content: string;
  audioBlob: Blob | null;
}

export default function BirthdayForm() {
  const [author, setAuthor] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Family Greetings state
  const [showFamilySection, setShowFamilySection] = useState(false);
  const [familyGreetings, setFamilyGreetings] = useState<FamilyGreeting[]>([]);

  const uploadMedia = async (blob: Blob | File, prefix: string) => {
    const fileExt = blob.type.split('/')[1]?.split(';')[0] || 'webm';
    const fileName = `${prefix}_${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, blob);

    if (!uploadError) {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return { url: data.publicUrl, type: blob.type.startsWith('image/') ? 'image' : 'audio' };
    }
    console.error("Upload error:", uploadError);
    return { url: null, type: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let mainMediaUrl = null;
    let mainMediaType = null;

    // Upload main file or audio
    if (file) {
      const res = await uploadMedia(file, 'main_file');
      mainMediaUrl = res.url;
      mainMediaType = res.type;
    } else if (audioBlob) {
      const res = await uploadMedia(audioBlob, 'main_audio');
      mainMediaUrl = res.url;
      mainMediaType = res.type;
    }

    // Upload family media and build JSON
    const familyGreetingsJson = [];
    for (const fg of familyGreetings) {
      let fgMediaUrl = null;
      let fgMediaType = null;
      if (fg.audioBlob) {
        const res = await uploadMedia(fg.audioBlob, `family_${fg.name}`);
        fgMediaUrl = res.url;
        fgMediaType = res.type;
      }
      familyGreetingsJson.push({
        name: fg.name,
        text_content: fg.text_content,
        media_url: fgMediaUrl,
        media_type: fgMediaType
      });
    }

    const { error } = await supabase.from('sentences').insert({
      author,
      text_content: textContent,
      media_url: mainMediaUrl,
      media_type: mainMediaType,
      family_greetings: familyGreetingsJson,
    });

    setLoading(false);
    if (!error) {
      setSubmitted(true);
    } else {
      console.error("Insert error details:", error);
      alert(`שגיאה בשמירה: ${error?.message || JSON.stringify(error)}\nהאם הרצת את פקודת ה-ALTER TABLE במסד הנתונים?`);
    }
  };

  const addFamilyGreeting = () => {
    setFamilyGreetings([...familyGreetings, { id: Math.random().toString(), name: '', text_content: '', audioBlob: null }]);
  };

  const updateFamilyGreeting = (id: string, field: keyof FamilyGreeting, value: any) => {
    setFamilyGreetings(familyGreetings.map(fg => fg.id === id ? { ...fg, [field]: value } : fg));
  };

  const removeFamilyGreeting = (id: string) => {
    setFamilyGreetings(familyGreetings.filter(fg => fg.id !== id));
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white p-8 rounded-3xl shadow-xl w-full text-center border border-green-100"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">איזה יופי, הברכה נשמרה בסוד! 🎉</h2>
        <p className="text-gray-600 mb-8 text-lg">
          עכשיו תור הדוד או הבן דוד הבא. אל תגלו לשימי!
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setAuthor('');
            setTextContent('');
            setFile(null);
            setAudioBlob(null);
            setFamilyGreetings([]);
            setShowFamilySection(false);
          }}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
        >
          הוסף ברכה נוספת
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Main Greeting Section */}
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <User className="w-4 h-4 text-purple-500" />
            השם שלכם (מי הכותב?)
          </label>
          <input
            type="text"
            required
            placeholder="למשל: דוד יוסי, אמא ושירה..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border-2 border-purple-100 p-4 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all bg-white/50"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Type className="w-4 h-4 text-blue-500" />
            המשפט שלכם לסיפור/לברכה:
          </label>
          <textarea
            required
            rows={4}
            placeholder="...כתבו כאן את המשפט או הברכה שלכם"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full border-2 border-blue-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all bg-white/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Camera className="w-4 h-4 text-orange-500" />
              צלם תמונה או בחר קובץ (אופציונלי):
            </label>
            <div className="relative border-2 border-dashed border-orange-200 rounded-2xl p-6 h-[172px] flex items-center justify-center hover:bg-orange-50/50 transition-colors group">
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment" // This triggers camera on mobile
                onChange={(e) => { setFile(e.target.files?.[0] || null); setAudioBlob(null); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2 text-orange-600 group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8" />
                <span className="font-semibold text-sm text-center px-4">
                  {file ? file.name : "לחץ לצילום / בחירת קובץ"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              הקלטה קולית (אופציונלי):
            </label>
            <div className="h-[172px] flex items-center justify-center" onClick={() => setFile(null)}>
              <AudioRecorder onRecordingComplete={setAudioBlob} />
            </div>
          </div>
        </div>
      </div>

      {/* Family Section */}
      <div className="border-t-2 border-gray-100 pt-8">
        {!showFamilySection ? (
          <button
            type="button"
            onClick={() => setShowFamilySection(true)}
            className="w-full py-4 border-2 border-dashed border-pink-300 rounded-2xl text-pink-600 font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            הוסף ברכות מהילדים / בת הזוג (אופציונלי)
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-pink-600 flex items-center gap-2">
                <Users className="w-6 h-6" />
                ברכות מבני המשפחה
              </h3>
              <button type="button" onClick={() => setShowFamilySection(false)} className="text-gray-400 hover:text-gray-600">
                סגור
              </button>
            </div>
            
            <AnimatePresence>
              {familyGreetings.map((fg, index) => (
                <motion.div
                  key={fg.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-pink-50 p-6 rounded-2xl border border-pink-100 space-y-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeFamilyGreeting(fg.id)}
                    className="absolute top-4 left-4 text-pink-400 hover:text-pink-600 bg-white rounded-full p-1 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h4 className="font-bold text-pink-800">מברך #{index + 1}</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">שם המברך/ת:</label>
                    <input
                      type="text"
                      required
                      placeholder="למשל: יונתן"
                      value={fg.name}
                      onChange={(e) => updateFamilyGreeting(fg.id, 'name', e.target.value)}
                      className="w-full border border-pink-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ברכה:</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="מזל טוב אבא!"
                      value={fg.text_content}
                      onChange={(e) => updateFamilyGreeting(fg.id, 'text_content', e.target.value)}
                      className="w-full border border-pink-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">הקלטה אישית:</label>
                    <AudioRecorder onRecordingComplete={(blob) => updateFamilyGreeting(fg.id, 'audioBlob', blob)} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={addFamilyGreeting}
              className="w-full py-3 bg-white border-2 border-pink-200 text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              הוסף מברך נוסף
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !author || !textContent}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-8"
      >
        {loading ? (
          <span className="animate-pulse">שומר ומעלה... (זה יכול לקחת רגע)</span>
        ) : (
          <>
            שלח את הברכה 🚀
            <Send className="w-6 h-6" />
          </>
        )}
      </button>
    </form>
  );
}
