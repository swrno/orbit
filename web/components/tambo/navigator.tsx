"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Loader2, Navigation } from "lucide-react";

interface NavigatorProps {
  path: string;
  isAbsolute?: boolean;
}

export function Navigator({ path, isAbsolute = false }: NavigatorProps) {
  const router = useRouter();
  const { currentWorkspaceId } = useAppStore();

  useEffect(() => {
    const performNavigation = async () => {
        // Small delay to allow user to read the message
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isAbsolute) {
            router.push(path);
        } else if (currentWorkspaceId) {
            // Ensure path doesn't start with / if we are appending
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            router.push(`/${currentWorkspaceId}/${cleanPath}`);
        }
    };

    performNavigation();
  }, [path, isAbsolute, currentWorkspaceId, router]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 max-w-sm shadow-sm flex items-center gap-3 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
         <Navigation className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-sm">Navigating...</p>
        <p className="text-xs text-muted-foreground">Taking you to {path}</p>
      </div>
    </div>
  );
}
