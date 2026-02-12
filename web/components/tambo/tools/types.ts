import type { Workspace, Page, PageType } from "@/lib/store";

export interface ToolContext {
  workspaceId: string;
  userId: string;
  userEmail?: string | null;
  workspaces?: Workspace[];
  updatePage?: (workspaceId: string, teamId: string, pageId: string, updates: Partial<Page>, userId?: string, userEmail?: string | null) => Promise<void>;
  addPage?: (workspaceId: string, teamId: string, title: string, type: PageType) => Promise<string>;
  router?: { push: (url: string) => void; refresh: () => void };
  activeTeamId?: string;
  activePageId?: string;
}
