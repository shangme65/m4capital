"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import Button from "@/components/ui/Button";

export default function HeroButtons() {
  const { data: session } = useSession();
  const router = useRouter();
  const { openSignupModal } = useModal();

  const handleTryDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedAccountType", "practice");
    }
    router.push("/traderoom");
  };

  const handleGoToTraderoom = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedAccountType", "real");
    }
    router.push("/traderoom");
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center pb-60 sm:pb-68">
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 items-center justify-center px-4 pointer-events-auto">
        <Button
          onClick={session ? handleGoToTraderoom : openSignupModal}
          variant="primary"
          size="md"
          className="!px-6"
        >
          {session ? "Go to Traderoom" : "Get Started"}
        </Button>
        {!session && (
          <Button
            onClick={handleTryDemo}
            variant="primary"
            size="md"
            className="!px-6 !bg-gradient-to-b !from-gray-500 !via-gray-600 !via-40% !to-gray-700 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_#111827,0_10px_8px_-2px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.4)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(107,114,128,0.8),0_10px_8px_-2px_rgba(107,114,128,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(107,114,128,0.5)] hover:translate-y-[2px]"
          >
            Try Free Demo
          </Button>
        )}
      </div>
    </div>
  );
}
