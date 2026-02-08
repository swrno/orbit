import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getNavigateToViewTool = (context: ToolContext): TamboTool => {
  const { workspaceId, router } = context;

  return {
    name: "navigate-to-view",
    description: "Navigate to a standard view (Bugs, Epics, Sprints, Backlog, etc.).",
    inputSchema: z.object({
      view: z.string().describe("The view name (e.g. 'bugs', 'epics', 'sprints', 'backlog', 'roadmap', 'settings')"),
    }),
    outputSchema: z.string(),
    tool: async ({ view }) => {
      if (!router) return "Error: Navigation unavailable.";
      router.push(`/${workspaceId}/${view.toLowerCase()}`);
      return `Navigating to ${view} view.`;
    },
  };
};
