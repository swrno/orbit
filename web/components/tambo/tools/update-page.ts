import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import type { Page } from "@/lib/store";

export const getUpdatePageTool = (context: ToolContext): TamboTool => {
  const { workspaceId, userId, userEmail, workspaces, updatePage } = context;

  return {
    name: "update-page",
    description: "Update the content of a document page. Overwrites existing content.",
    inputSchema: z.object({
      pageId: z.string().optional().describe("The ID of the page to update"),
      title: z.string().optional().describe("The title of the page to update (if ID is unknown)"),
      content: z.string().describe("The new HTML content for the page"),
    }),
    outputSchema: z.string(),
    tool: async ({ pageId, title, content }) => {
      if (!workspaces || !updatePage) return "Error: Store functions not available.";
      
      const ws = workspaces.find(w => w.id === workspaceId);
      if (!ws) return "Error: Current workspace not found.";

      let target: { page: Page; teamId: string } | undefined;

      if (pageId) {
        for (const team of ws.teams) {
          const p = team.pages.find(pg => pg.id === pageId);
          if (p) { target = { page: p, teamId: team.id }; break; }
        }
      }

      if (!target && title) {
        for (const team of ws.teams) {
          const p = team.pages.find(pg => pg.title.toLowerCase() === title.toLowerCase());
          if (p) { target = { page: p, teamId: team.id }; break; }
        }
      }

      if (!target) return "Error: Page not found.";

      try {
        // Verify updatePage is available (already checked)
        updatePage(workspaceId, target.teamId, target.page.id, { content }, userId, userEmail);
        return `Successfully updated page: ${target.page.title}`;
      } catch (error: any) {
        return `Error updating page: ${error.message}`;
      }
    },
  };
};
