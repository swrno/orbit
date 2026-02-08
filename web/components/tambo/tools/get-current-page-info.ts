import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import type { Page } from "@/lib/store";

export const getGetCurrentPageInfoTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces, activePageId } = context;

  return {
    name: "get-current-page-info",
    description: "Get information about the currently active page (title, content, type). Use this when the user refers to 'this page' or 'the current document'.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
    tool: async () => {
      if (!workspaces) return "Error: Workspaces not available.";
      if (!activePageId) return "No active page found. The user is likely on a dashboard or non-document view.";

      const ws = workspaces.find(w => w.id === workspaceId);
      if (!ws) return "Error: Current workspace not found.";

      let foundPage: Page | undefined;
      let foundTeamTitle: string | undefined;

      for (const team of ws.teams) {
         const p = team.pages.find(pg => pg.id === activePageId);
         if (p) { 
           foundPage = p; 
           foundTeamTitle = team.title;
           break; 
         }
      }

      if (!foundPage) return `Active page ID '${activePageId}' not found in workspace.`;

      // Return structured info
      return `Current Page Info:
Title: ${foundPage.title}
ID: ${foundPage.id}
Type: ${foundPage.type}
Team: ${foundTeamTitle}
Content:
${foundPage.content || "(Empty)"}`;
    },
  };
};
