"use client";

import { TamboProvider } from "@tambo-ai/react";
import { tamboRegistry } from "@/lib/tambo-registry";
import { GlobalChat } from "@/components/ai/GlobalChat";

export function TamboWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamboProvider
      components={tamboRegistry}
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
    >
      {children}
      <GlobalChat />
    </TamboProvider>
  );
}
