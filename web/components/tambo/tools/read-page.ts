import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import type { Page } from "@/lib/store";

export const getReadPageTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces } = context;

  return {
    name: "read-page",
    description: "Read the content of a document page by its ID or Title. Use this before editing to see current content.",
    inputSchema: z.object({
      pageId: z.string().optional().describe("The ID of the page to read"),
      title: z.string().optional().describe("The title of the page to read (if ID is unknown)"),
    }),
    outputSchema: z.string(),
    tool: async ({ pageId, title }) => {
      if (!workspaces) return "Error: Workspaces not available.";
      
      const ws = workspaces.find(w => w.id === workspaceId);
      if (!ws) return "Error: Current workspace not found.";

      let foundPage: Page | undefined;
      
      if (pageId) {
        for (const team of ws.teams) {
          const p = team.pages.find(pg => pg.id === pageId);
          if (p) { foundPage = p; break; }
        }
      } 
      
      if (!foundPage && title) {
        for (const team of ws.teams) {
          const p = team.pages.find(pg => pg.title.toLowerCase() === title.toLowerCase());
          if (p) { foundPage = p; break; }
        }
      }

      if (!foundPage) return "Error: Page not found.";
      return foundPage.content || "(Empty Page)";
    },
  };
};
