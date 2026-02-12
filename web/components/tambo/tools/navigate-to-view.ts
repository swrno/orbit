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
          const findPageRecursive = (teams: any[]): { page: any, teamId: string } | null => {
            for (const team of teams) {
              if (team.pages) {
                const page = team.pages.find((p: any) => p.title.toLowerCase() === normalizedView.toLowerCase());
                if (page) return { page, teamId: team.id };
              }
              if (team.teams && team.teams.length > 0) {
                const found = findPageRecursive(team.teams);
                if (found) return found;
              }
            }
            return null;
          };

          const result = findPageRecursive(ws.teams || []);
          if (result) {
            router.push(`/${workspaceId}/${result.teamId}/${result.page.id}`);
            return `Navigating to ${result.page.title}.`;
          }
        }
      }

      // 3. Fallback to static route ONLY for known static views
      const staticViews = ["backlog", "roadmap", "settings", "team access"];
      if (staticViews.includes(normalizedView.toLowerCase()) && workspaces) {
        const ws = workspaces.find(w => w.id === workspaceId);
        const teamId = ws?.teams?.[0]?.id || "main"; // Fallback to first team
        const route = normalizedView.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${workspaceId}/${teamId}/${route}`);
        return `Navigating to ${normalizedView}.`;
      }

      return `Error: Could not find a page named '${view}'. Please verify the page name.`;
    },
  };
};
