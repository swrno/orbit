"use client";

import { TiptapEditor } from "@/components/views/TiptapEditor";

interface DocumentViewProps {
  workspaceId: string;
  pageId: string;
}

export function DocumentView({ workspaceId, pageId }: DocumentViewProps) {
  return <TiptapEditor workspaceId={workspaceId} pageId={pageId} />;
}
