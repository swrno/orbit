import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getListWorkspacesTool = (context: ToolContext): TamboTool => {
  const { workspaces } = context;

  return {
    name: "list-workspaces",
    description: "List all workspaces available to the current user, including their IDs, titles, and keys.",
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        key: z.string(),
      })
    ),
    tool: async () => {
      if (!workspaces || workspaces.length === 0) {
        return "Error: No workspaces found or loaded.";
      }

      return workspaces.map((ws) => ({
        id: ws.id,
        title: ws.title,
        key: ws.key,
      }));
    },
  };
};
