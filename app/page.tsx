import { createServerClient } from '@/utils/supabase/server';
import WelcomeWizard from '@/components/WelcomeWizard';
import { Lock } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: lockSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'is_locked')
    .single();

  const isLocked = lockSetting?.value === 'true' || lockSetting?.value === true;

  if (isLocked) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#FDFBF7] p-8 sm:p-12 shadow-lg max-w-2xl w-full text-center border border-stone-200 relative">
          {/* Tape on the form */}
          <div className="absolute -top-3 -left-4 w-20 h-6 bg-red-200/80 backdrop-blur-sm rotate-3 z-20 shadow-sm border border-white/40 mix-blend-multiply"></div>
          <div className="absolute -bottom-3 -right-4 w-20 h-6 bg-red-200/80 backdrop-blur-sm -rotate-3 z-20 shadow-sm border border-white/40 mix-blend-multiply"></div>

          <div className="w-24 h-24 bg-stone-100 border-2 border-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-red-700/80 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-6 drop-shadow-sm">הסיפור של שימי ננעל ונשמר בסוד! 🤫</h1>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            תודה לכל הדודים והבני דודים שהשתתפו והוסיפו משפטים וברכות. המילים וההקלטות שלכם עוברות עכשיו עיבוד מיוחד...
          </p>
          <div className="mt-8 p-6 bg-[#FEF3C7] border border-[#FDE68A] shadow-sm transform rotate-1">
            <p className="text-amber-800 font-bold text-xl">
              ניפגש ביום ההולדת לחשיפה הגדולה! 🎉
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: sentences } = await supabase
    .from('sentences')
    .select('text_content');

  let randomSentence = 'שימי, מזל טוב ליום הולדתך, מאחל לך את כל הטוב שבעולם';

  if (sentences && sentences.length > 0) {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    randomSentence = sentences[randomIndex].text_content;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full pt-8">
        <WelcomeWizard randomSentence={randomSentence} />
      </div>
    </main>
  );
}
