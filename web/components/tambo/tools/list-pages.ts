import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getListPagesTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces } = context;

  return {
    name: "list-pages",
    description:
      "List all pages available in the current workspace, organized by team. Use this to find the exact name or ID of a page when the user asks to navigate somewhere.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      workspaceName: z.string(),
      teams: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          pages: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              type: z.string(),
            })
          ),
          subTeams: z.array(z.any()).optional(), // specific structure can be recursive
        })
      ),
    }),
    tool: async () => {
      if (!workspaces) return { error: "No workspaces available" };

      const ws = workspaces.find((w) => w.id === workspaceId);
      if (!ws) return { error: "Current workspace not found" };

      // Helper to recursively map teams
      const mapTeam = (team: any) => ({
        id: team.id,
        title: team.title,
        pages: team.pages.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: p.type,
        })),
        subTeams: team.teams ? team.teams.map(mapTeam) : [],
      });

      const structure = {
        workspaceName: ws.title,
        teams: ws.teams.map(mapTeam),
      };

      return structure;
    },
  };
};
