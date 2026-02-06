import { TamboProvider } from "@tambo-ai/react";
import { components, tools } from "@/lib/tambo";
import { MessageThreadCollapsible } from "@/components/tambo/message-thread-collapsible";

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
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <MessageThreadCollapsible />
      </div>
    </TamboProvider>
  );
}
