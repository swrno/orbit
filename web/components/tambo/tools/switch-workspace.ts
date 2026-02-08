import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getSwitchWorkspaceTool = (context: ToolContext): TamboTool => {
  const { workspaces, router } = context;

  return {
    name: "switch-workspace",
    description: "Switch to a different workspace by name or ID.",
    inputSchema: z.object({
      workspaceId: z.string().optional().describe("The ID of the workspace to switch to"),
      name: z.string().optional().describe("The name of the workspace to switch to (if ID is unknown)"),
    }),
    outputSchema: z.string(),
    tool: async ({ workspaceId: targetId, name }) => {
      if (!workspaces || !router) return "Error: Navigation unavailable.";
      
      let target = targetId ? workspaces.find(w => w.id === targetId) : undefined;
      if (!target && name) {
        target = workspaces.find(w => w.title.toLowerCase() === name.toLowerCase());
      }

      if (!target) return "Error: Workspace not found.";
      
      router.push(`/${target.id}`);
      return `Switching to workspace: ${target.title}`;
    },
  };
};
