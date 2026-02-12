import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import type { Page } from "@/lib/store";

export const getNavigateToPageTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces, router } = context;

  return {
    name: "navigate-to-page",
    description: "Navigate to a specific document page within the current workspace.",
    inputSchema: z.object({
      pageId: z.string().optional().describe("The ID of the page to navigate to"),
      title: z.string().optional().describe("The title of the page to navigate to"),
    }),
    outputSchema: z.string(),
    tool: async ({ pageId, title }) => {
       if (!workspaces || !router) return "Error: Navigation unavailable.";
       
       const ws = workspaces.find(w => w.id === workspaceId);
       if (!ws) return "Error: Current workspace not found.";

       let foundPage: Page | undefined;
       let foundTeamId: string | undefined;

       if (pageId) {
          for (const team of ws.teams) {
            const p = team.pages.find(pg => pg.id === pageId);
            if (p) { 
              foundPage = p; 
              foundTeamId = team.id;
              break; 
            }
          }
       }
       if (!foundPage && title) {
          for (const team of ws.teams) {
            const p = team.pages.find(pg => pg.title.toLowerCase() === title.toLowerCase());
            if (p) { 
              foundPage = p; 
              foundTeamId = team.id;
              break; 
            }
          }
       }

       if (!foundPage || !foundTeamId) return "Error: Page not found.";
       
       router.push(`/${workspaceId}/${foundTeamId}/${foundPage.id}`);
       return `Navigating to page: ${foundPage.title}`;
    },
  };
};
