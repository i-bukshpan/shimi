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
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-center border border-white/50">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-red-500 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-6">הסיפור של שימי ננעל ונשמר בסוד! 🤫</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            תודה לכל הדודים והבני דודים שהשתתפו והוסיפו משפטים וברכות. המילים וההקלטות שלכם עוברות עכשיו עיבוד מיוחד...
          </p>
          <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-purple-800 font-bold text-xl">
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
