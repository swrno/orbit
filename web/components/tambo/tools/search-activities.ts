import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";


export const getSearchActivitiesTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces } = context;

  return {
    name: "search-activities",
    description: "Search and filter activities (Bugs, Tasks, Epics, Sprints, Retrospectives) across the workspace. Use this to find specific items based on keywords, type, status, or assignee.",
    inputSchema: z.object({
      query: z.string().optional().describe("The search text to match against titles and descriptions"),
      type: z.enum(["bug", "task", "epic", "sprint", "retro", "all"]).optional().default("all").describe("The type of activity to search for"),
      status: z.string().optional().describe("Filter by status (e.g., 'Done', 'In Progress', 'Critical')"),
      assignee: z.string().optional().describe("Filter by assignee name"),
    }),
    outputSchema: z.string(),
    tool: async ({ query, type, status, assignee }) => {
      const { router, workspaceId, workspaces } = context;
      const q = query || "";
      const currentWorkspace = workspaces?.find(w => w.id === workspaceId);

      if (!currentWorkspace) return "Error: Workspace not found.";
      if (!router) return "Error: Router not available.";

      let targetView = "";
      
      // Determine target view based on type
      if (type === 'bug') targetView = "Bugs";
      else if (type === 'task') targetView = "Tasks";
      else if (type === 'epic') targetView = "Epics";
      else if (type === 'sprint') targetView = "Sprints";
      else if (type === 'retro') targetView = "Retrospectives";
      else {
        // Default to a general search or specific view if query implies type
        // For 'all', we might want to default to Tasks or a global search page if it existed.
        // For now, let's default to Tasks as it's the most common work item.
        targetView = "Tasks"; 
      }

      // Find the page ID for the target view
      let targetPageId = "";
      if (currentWorkspace.teams) {
        for (const team of currentWorkspace.teams) {
          // Look for a page that matches the target view type
          // Assuming page titles or types map to these view names
          // The page structure has 'type' which often matches the view name (lowercase)
          const page = team.pages.find(p => 
            p.type === targetView.toLowerCase() || 
            p.title.toLowerCase().includes(targetView.toLowerCase())
          );
          if (page) {
            targetPageId = page.id;
            break;
          }
        }
      }

      if (targetPageId) {
        const searchUrl = `/${workspaceId}/${targetPageId}?q=${encodeURIComponent(q)}`;
        router.push(searchUrl);
        return `Navigating to ${targetView} view to search for "${q}"...`;
      } else {
         // Fallback - if specific page not found, maybe just try to navigate URL scheme if it follows pattern
         // or return error
         // Let's try to find *any* page that might be relevant
         return `Could not find a "${targetView}" page in this workspace. Please ensure the view exists.`;
      }
    },
  };
};
