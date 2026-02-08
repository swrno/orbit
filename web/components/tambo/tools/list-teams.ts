import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getListTeamsTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces } = context;

  return {
    name: "list-teams",
    description: "List all teams in the current workspace, including their IDs and titles.",
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        subTeams: z.array(z.any()).optional(),
        icon: z.string().optional(),
      })
    ),
    tool: async () => {
      if (!workspaces) return "Error: No workspaces available";

      const ws = workspaces.find((w) => w.id === workspaceId);
      if (!ws) return "Error: Current workspace not found";

      // Helper to recursively map teams structure, focusing only on team info
      const mapTeam = (team: any) => ({
        id: team.id,
        title: team.title,
        icon: team.icon,
        subTeams: team.teams ? team.teams.map(mapTeam) : [],
      });

      return ws.teams.map(mapTeam);
    },
  };
};
