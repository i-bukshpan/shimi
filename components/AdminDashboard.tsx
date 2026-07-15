'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminDashboard() {
  const [sentences, setSentences] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sentencesData } = await supabase.from('sentences').select('*').order('created_at', { ascending: true });
    if (sentencesData) setSentences(sentencesData);

    const { data: lockData } = await supabase.from('site_settings').select('value').eq('key', 'is_locked').single();
    if (lockData) setIsLocked(lockData.value === 'true' || lockData.value === true);
  };

  const toggleLock = async () => {
    const newValue = (!isLocked).toString();
    const { error } = await supabase.from('site_settings').update({ value: newValue }).eq('key', 'is_locked');
    if (error) {
      console.error("Lock error:", error);
      alert(`שגיאה בנעילת האתר: ${error.message}\nהאם הרצת את פקודת ההרשאות (UPDATE) ב-Supabase?`);
    } else {
      setIsLocked(!isLocked);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#FDFBF7] p-6 rounded-sm shadow-sm border border-stone-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ניהול האתר</h2>
          <p className="text-gray-500">שליטה בנעילת האתר וצפייה במשפטים</p>
        </div>
        <button
          onClick={toggleLock}
          className={`px-6 py-2 rounded-sm font-bold text-white transition-colors border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${isLocked ? 'bg-red-500 border-red-600' : 'bg-green-500 border-green-600'}`}
        >
          {isLocked ? 'האתר נעול (לחץ לפתיחה)' : 'האתר פתוח (לחץ לנעילה)'}
        </button>
      </div>

      <div className="bg-[#FDFBF7] rounded-sm shadow-sm border border-stone-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-gray-600 font-semibold">כותב</th>
              <th className="p-4 text-gray-600 font-semibold">משפט</th>
              <th className="p-4 text-gray-600 font-semibold">מדיה</th>
              <th className="p-4 text-gray-600 font-semibold">תאריך</th>
              <th className="p-4 text-gray-600 font-semibold">משפחה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sentences.map((s) => (
              <React.Fragment key={s.id}>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{s.author}</td>
                  <td className="p-4 text-gray-600 max-w-xs md:max-w-md truncate">{s.text_content}</td>
                  <td className="p-4 whitespace-nowrap">
                    {s.media_url ? (
                      <a href={s.media_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        צפה ב{s.media_type === 'image' ? 'תמונה' : 'הקלטה/וידאו'}
                      </a>
                    ) : (
                      <span className="text-gray-400">אין</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{new Date(s.created_at).toLocaleString('he-IL')}</td>
                  <td className="p-4">
                    {(s.family_greetings && s.family_greetings.length > 0) ? (
                      <button 
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-semibold text-sm bg-pink-50 px-3 py-1 rounded-full"
                      >
                        {s.family_greetings.length} ברכות
                        {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">אין</span>
                    )}
                  </td>
                </tr>
                {expandedId === s.id && s.family_greetings && (
                  <tr className="bg-pink-50/50">
                    <td colSpan={5} className="p-6">
                      <h4 className="font-bold text-pink-800 mb-4">ברכות משפחה מ-{s.author}</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {s.family_greetings.map((fg: any, i: number) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm">
                            <p className="font-bold text-gray-800 mb-1">{fg.name}</p>
                            <p className="text-gray-600 text-sm mb-3">{fg.text_content}</p>
                            {fg.media_url && (
                              <a href={fg.media_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm inline-flex items-center gap-1">
                                🎵 האזן להקלטה
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {sentences.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">אין עדיין משפטים</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
