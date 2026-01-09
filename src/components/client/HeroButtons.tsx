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
        <Button
          onClick={handleTryDemo}
          variant="secondary"
          size="md"
          className="!px-6"
        >
          Try Free Demo
        </Button>
      </div>
    </div>
  );
}
