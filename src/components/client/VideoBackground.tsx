"use client";

export default function VideoBackground() {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden opacity-20">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
    </div>
  );
}
