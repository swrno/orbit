import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";

export const getRefreshPageTool = (context: ToolContext): TamboTool => {
  const { router } = context;

  return {
    name: "refresh-page",
    description: "Refresh the current page content. Use this to ensure the AI creates tasks/pages that are reflected in the UI, or if the user asks to reload.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
    tool: async () => {
      if (!router) return "Error: Navigation/Refresh unavailable.";
      router.refresh();
      return "Successfully triggered a page refresh.";
    },
  };
};
