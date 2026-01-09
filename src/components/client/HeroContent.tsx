"use client";

import HeroTitle from "./HeroTitle";
import HeroDescription from "./HeroDescription";

interface HeroContentProps {
  title: string;
  description: string;
  contentIndex: number;
  titleAnimation: {
    initial: { opacity: number; x?: number; y?: number; scale?: number };
    animate: { opacity: number; x?: number; y?: number; scale?: number };
    exit: { opacity: number; x?: number; y?: number; scale?: number };
  };
  descAnimation: {
    initial: { opacity: number; x?: number; y?: number; scale?: number };
    animate: { opacity: number; x?: number; y?: number; scale?: number };
    exit: { opacity: number; x?: number; y?: number; scale?: number };
  };
}

export default function HeroContent({
  title,
  description,
  contentIndex,
  titleAnimation,
  descAnimation,
}: HeroContentProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-center text-white px-4 sm:px-6 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <HeroTitle
          title={title}
          contentIndex={contentIndex}
          animation={titleAnimation}
        />
        <HeroDescription
          description={description}
          contentIndex={contentIndex}
          animation={descAnimation}
        />
      </div>
    </div>
  );
}
