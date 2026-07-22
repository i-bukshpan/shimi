"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Trash2, Lock, Unlock, Download } from "lucide-react";
import { checkAdminPassword } from "./actions";

type AICreation = {
  id: string;
  created_at: string;
  author: string;
  raw_blessing: string;
  generated_media_url: string;
  media_type: string;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [creations, setCreations] = useState<AICreation[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    // Fetch creations
    const { data: creationsData } = await supabase
      .from("ai_creations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (creationsData) setCreations(creationsData);

    // Fetch settings
    const { data: settingsData } = await supabase
      .from("admin_settings")
      .select("is_locked")
      .limit(1)
      .single();
      
    if (settingsData) setIsLocked(settingsData.is_locked);
  };



  const handleLogin = async () => {
    setIsLoadingAuth(true);
    const isValid = await checkAdminPassword(password);
    if (isValid) {
      setIsAuthenticated(true);
    } else {
      alert("סיסמא שגויה");
    }
    setIsLoadingAuth(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("בטוח שברצונך למחוק יצירה זו?")) return;
    
    await supabase.from("ai_creations").delete().eq("id", id);
    setCreations(creations.filter(c => c.id !== id));
  };

  const toggleLock = async () => {
    const newLockState = !isLocked;
    await supabase.from("admin_settings").update({ is_locked: newLockState }).eq("id", 1); // assuming id=1 or just updating all
    setIsLocked(newLockState);
    alert(`האתר כרגע ${newLockState ? 'נעול' : 'פתוח'}`);
  };

  const exportCSV = () => {
    const headers = ["ID", "Date", "Author", "Blessing", "Media URL", "Type"];
    const csvContent = [
      headers.join(","),
      ...creations.map(c => 
        `"${c.id}","${new Date(c.created_at).toLocaleString()}","${c.author}","${c.raw_blessing.replace(/"/g, '""')}","${c.generated_media_url}","${c.media_type}"`
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "shimi_birthday_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-4 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center">כניסת מנהל</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="border border-stone-300 rounded-lg p-3 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="****"
            dir="ltr"
          />
          <button 
            onClick={handleLogin}
            disabled={isLoadingAuth}
            className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoadingAuth ? 'בודק...' : 'היכנס'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">פאנל ניהול - אלבום יום הולדת</h1>
            <p className="text-stone-500 mt-1">{creations.length} יצירות נוצרו עד כה</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 bg-stone-100 border border-stone-300 px-4 py-2 rounded-lg font-medium hover:bg-stone-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              ייצא ל-CSV
            </button>
            <button 
              onClick={toggleLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${isLocked ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200' : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'}`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isLocked ? 'האתר נעול (שלב 2)' : 'האתר פתוח (שלב 1)'}
            </button>
          </div>
        </header>



        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-stone-100 border-b border-stone-200 text-stone-600">
              <tr>
                <th className="p-4 font-medium">תאריך</th>
                <th className="p-4 font-medium">שם השולח</th>
                <th className="p-4 font-medium">טקסט (ברכה/זיכרון)</th>
                <th className="p-4 font-medium">סוג מדיה</th>
                <th className="p-4 font-medium text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {creations.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 text-sm text-stone-500" dir="ltr">{new Date(c.created_at).toLocaleString('he-IL')}</td>
                  <td className="p-4 font-medium text-stone-800">{c.author}</td>
                  <td className="p-4 text-stone-600 max-w-md truncate">{c.raw_blessing}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {c.media_type}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                      title="מחק יצירה"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {creations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    אין עדיין יצירות להצגה
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
