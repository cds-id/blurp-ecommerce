"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ChatBubbleProps {
  className?: string;
}

export function ChatBubble({ className }: ChatBubbleProps) {
  return (
    <Button
      size="icon"
      aria-label="Chat WhatsApp"
      className={cn(
        "fixed bottom-6 right-4 h-14 w-14 rounded-full shadow-lg",
        "bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-black/10 shadow-xl outline outline-1 outline-white/30",
        "z-40",
        className
      )}
      onClick={() => {
        window.open("https://wa.me/6281234567890", "_blank");
      }}
    >
      <MessageCircle className="h-6 w-6 text-white stroke-white" />
    </Button>
  );
}
