"use client";

import React from "react";
import { Shell } from "@/components/layout/Shell";
import Sidebar from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { TamboProvider } from "@tambo-ai/react";
import { components, createTools } from "@/lib/tambo";
import { MessageThreadCollapsible } from "@/components/tambo/message-thread-collapsible";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { useAuth } from "@/contexts/AuthContext";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { workspaces, selectWorkspace, updatePage, addPage } = useAppStore();
  const mcpServers = useMcpServers();
  const { user } = useAuth();
  
  const tools = React.useMemo(() => {
    return createTools({ 
      workspaceId, 
      userId: user?.uid || 'anonymous',
      userEmail: user?.email,
      workspaces,
      updatePage,
      addPage,
      activePageId: params.pageId as string,
      router
    });
  }, [workspaceId, user?.uid, user?.email, workspaces, updatePage, addPage, router, params.pageId]);

  useEffect(() => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (!workspace) {
      router.push("/dashboard");
    } else {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, workspaces, router, selectWorkspace]);

  if (!workspaces.find((w) => w.id === workspaceId)) {
    return null; // Or loading spinner
  }

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || ""}
      components={components}
      tools={tools}
      mcpServers={mcpServers}
    >
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Shell>
            <Sidebar />
            <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden bg-background">
              {children}
            </main>
            <MessageThreadCollapsible className="z-50" />
          </Shell>
        </div>
      </div>
    </TamboProvider>
  );
}
