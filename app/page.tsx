import BirthdayCanvas from "@/components/BirthdayCanvas";
import Sidebar from "@/components/Sidebar";
import UserMediaUploader from "@/components/UserMediaUploader";
import OnlineIndicator from "@/components/OnlineIndicator";
import WelcomePopup from "@/components/WelcomePopup";
import AboutModal from "@/components/AboutModal";

export default function Home() {
  return (
    <main className="h-[100dvh] w-full bg-[#FAF6F0] text-stone-800 font-sans flex flex-row overflow-hidden" dir="rtl">
      <WelcomePopup />
      <AboutModal />
      {/* Sidebar - Right on desktop, Top/Bottom on mobile */}
      <Sidebar />

      {/* Main Canvas Area */}
      <section className="flex-1 h-full relative z-10 w-full">
        {/* The React Flow Canvas */}
        <BirthdayCanvas />
        <OnlineIndicator />
      </section>

      {/* Global Floating Components */}
      <UserMediaUploader />
    </main>
  );
}
