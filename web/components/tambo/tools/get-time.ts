import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getGetTimeTool = (context: ToolContext): TamboTool => {
  return {
    name: "get-time",
    description: "Get the current formatted local time.",
    tool: async () => {
      return new Date().toLocaleString();
    },
    inputSchema: z.object({}),
    outputSchema: z.string(),
  };
};
