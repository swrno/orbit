import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getNavigateToViewTool = (context: ToolContext): TamboTool => {
  const { workspaceId, router, workspaces } = context;

  return {
    name: "navigate-to-view",
    description: "Navigate to a standard view (e.g. Bugs, Epics, Retrospectives, Sprints). Accepts short forms like 'retro', 'bug', 'sprint'.",
    inputSchema: z.object({
      view: z.string().describe("The view name or short form (e.g. 'retro', 'bugs', 'sprints', 'backlog')"),
    }),
    outputSchema: z.string(),
    tool: async ({ view }) => {
      if (!router) return "Error: Navigation unavailable.";

      // 1. Normalize aliases
      const aliases: Record<string, string> = {
        "retro": "Retrospectives",
        "retrospectives": "Retrospectives",
        "bug": "Bugs",
        "bugs": "Bugs",
        "epic": "Epics",
        "epics": "Epics",
        "sprint": "Sprints",
        "sprints": "Sprints",
        "task": "Tasks",
        "tasks": "Tasks",
        "backlog": "Backlog",
        "roadmap": "Roadmap",
        "settings": "Settings",
        "team": "Team Access"
      };

      const normalizedView = aliases[view.toLowerCase()] || view;
      
      // 2. Try to find a matching page in the current workspace (for dynamic pages)
      if (workspaces) {
        const ws = workspaces.find(w => w.id === workspaceId);
        if (ws) {
          for (const team of ws.teams) {
            const page = team.pages.find(p => p.title.toLowerCase() === normalizedView.toLowerCase());
            if (page) {
              router.push(`/${workspaceId}/${page.id}`);
              return `Navigating to ${page.title}.`;
            }
          }
        }
      }

      // 3. Fallback to static route (legacy or standard views explicitly routed)
      router.push(`/${workspaceId}/${normalizedView.toLowerCase()}`);
      return `Navigating to ${normalizedView} view.`;
    },
  };
};
