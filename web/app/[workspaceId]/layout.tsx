"use client";

import { Shell } from "@/components/layout/Shell";
import Sidebar from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { TamboProviderWrapper } from "@/components/providers/TamboProviderWrapper";
import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { workspaces, selectWorkspace } = useAppStore();

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
    <TamboProviderWrapper>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Shell>
            <Sidebar />
            <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden bg-background">
              {children}
            </main>
          </Shell>
        </div>
      </div>
    </TamboProviderWrapper>
  );
}
