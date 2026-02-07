import { TamboProvider } from "@tambo-ai/react";
import { components, tools } from "@/lib/tambo";

export function TamboProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? ""}
      components={components}
      tools={tools}
    >
      {children}
    </TamboProvider>
  );
}
