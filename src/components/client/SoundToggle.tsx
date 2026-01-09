"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/ambient-trading.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
  }, []);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {});
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed top-24 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-200 group"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-white/60 group-hover:text-white" />
      ) : (
        <Volume2 className="w-5 h-5 text-orange-500 group-hover:text-orange-400" />
      )}
    </button>
  );
}
