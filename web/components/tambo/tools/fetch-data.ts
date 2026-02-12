import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import { apiClient } from "@/lib/api-client";

export const getFetchDataTool = (context: ToolContext): TamboTool => {
  const { workspaceId, workspaces } = context;

  return {
    name: "fetch-data",
    description: "Fetch data for various resources (Bugs, Tasks, Epics, Sprints, Retrospectives) from the current workspace. This tool returns the raw data as JSON.",
    inputSchema: z.object({
      resource: z.enum(["bugs", "tasks", "epics", "sprints", "retrospectives"])
        .describe("The type of resource to fetch"),
      teamId: z.string().optional()
        .describe("Optional Team ID to filter by. If not provided, it may fetch for the whole workspace or require a team context."),
      pageId: z.string().optional()
        .describe("Optional Page ID to filter by."),
      limit: z.number().optional().default(20)
        .describe("Max number of items to return"),
      filters: z.string().optional()
        .describe("Additional filters as a JSON string (e.g. '{\"status\": \"Done\", \"sprint\": \"Sprint 1\"}')")
    }),
    outputSchema: z.any(),
    tool: async ({ resource, teamId, pageId, limit, filters }) => {
      // Basic validation
      if (!workspaceId) return { error: "No workspace context available." };

      let parsedFilters: Record<string, any> | undefined;
      if (filters) {
        try {
          parsedFilters = JSON.parse(filters);
        } catch (e) {
          return { error: "Invalid JSON format for filters" };
        }
      }

      // Infer teamId if not provided but activePageId is available
      if (!teamId && context.activePageId && workspaces && workspaces.length > 0) {
        const currentWorkspace = workspaces.find(w => w.id === workspaceId);
        if (currentWorkspace) {
          const activeTeam = currentWorkspace.teams?.find(t =>
            t.pages?.some(p => p.id === context.activePageId)
          );
          if (activeTeam) {
            teamId = activeTeam.id;
          }
        }
      }

      const params: Record<string, string> = { workspaceId };
      if (teamId) params.teamId = teamId;
      if (pageId) params.pageId = pageId;

      // Add specific filters from parsedFilters if any
      if (parsedFilters) {
        Object.entries(parsedFilters).forEach(([key, value]) => {
          if (typeof value === 'string') {
             params[key] = value;
          }
        });
      }

      try {
        const json = await apiClient.fetchResources(resource, params);
        
        if (!json.success) {
          return { error: json.error || "Unknown API error" };
        }

        let data = json.data;
        if (!Array.isArray(data)) {
          return { data }; // Single object or other format
        }

        // Apply client-side filtering for complex filters if needed
        if (parsedFilters) {
          data = data.filter((item: any) => {
            for (const [key, value] of Object.entries(parsedFilters!)) {
              if (params[key]) continue; // Already handled by API params
              // precise match for now
              if (item[key] !== value) return false;
            }
            return true;
          });
        }

        // Apply limit
        if (limit && limit > 0) {
          data = data.slice(0, limit);
        }

        return {
          count: data.length,
          data: data
        };

      } catch (error: any) {
        return { error: error.message || "Fetch failed" };
      }
    },
  };
};
