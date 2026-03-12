"use client";

import Image from "next/image";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * A logo component that instantly switches between light and dark logos
 * using CSS classes tied to the document's theme class.
 * This avoids React state delays and makes the switch immediate.
 */
export default function ThemeLogo({
  width = 120,
  height = 40,
  className = "",
  priority = false,
}: ThemeLogoProps) {
  return (
    <div className={`relative ${className}`} suppressHydrationWarning>
      {/* Dark mode logo - visible when html has 'dark' class */}
      <Image
        src="/m4capitallogo1.png"
        alt="M4 Capital Logo"
        width={width}
        height={height}
        className="object-contain dark:block hidden"
        priority={priority}
        suppressHydrationWarning
      />
      {/* Light mode logo - visible when html doesn't have 'dark' class */}
      <Image
        src="/M4LightLogo.png"
        alt="M4 Capital Logo"
        width={width}
        height={height}
        className="object-contain dark:hidden block"
        priority={priority}
        suppressHydrationWarning
      />
    </div>
  );
}
