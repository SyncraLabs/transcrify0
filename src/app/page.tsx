
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import Transcriber from "@/components/Transcriber";
import { Footer } from "@/components/footer";
import { dictionary, Language } from "@/lib/i18n";

export default function Home() {
  const [lang, setLang] = useState<Language>("es"); // Default to Spanish as per user context (syncralabs.es)

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  };

  const dict = dictionary[lang];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar lang={lang} dict={dict} onToggleLang={toggleLang} />
      <div className="flex-1 flex justify-center w-full pt-20">
        <Transcriber />
      </div>
      <Footer dict={dict} />
    </main>
  );
}
