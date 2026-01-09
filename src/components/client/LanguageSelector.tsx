"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  const handleSelect = (lang: typeof languages[0]) => {
    setSelected(lang);
    setIsOpen(false);
    // TODO: Implement actual language change
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-all"
        whileHover={{ scale: 1.05 }}
      >
        <Globe className="w-4 h-4 text-white" />
        <span className="text-white text-sm">{selected.flag}</span>
        <span className="text-white text-sm font-medium">{selected.code.toUpperCase()}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-12 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-xl min-w-[160px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/20 transition-all ${
                selected.code === lang.code ? "bg-white/10" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-white text-sm">{lang.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
