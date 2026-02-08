import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const getBugsTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "get-bugs",
  description: "Fetch bugs from the workspace. Can filter by team, page, or group (status).",
  tool: async (args) => {
    const params = new URLSearchParams({ workspaceId });
    if (args.teamId) params.append("teamId", args.teamId);
    if (args.pageId) params.append("pageId", args.pageId);
    if (args.group) params.append("group", args.group);

    try {
        const response = await fetch(`/api/bugs?${params.toString()}`);
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return JSON.stringify(data.data);
    } catch (e: any) {
        return `Error fetching bugs: ${e.message}`;
    }
  },
    inputSchema: z.object({
    teamId: z.string().optional().describe("The ID of the team to fetch bugs for"),
    pageId: z.string().optional().describe("The ID of the page to fetch bugs for"),
    group: z.string().optional().describe("Filter by group/status (e.g., 'Incoming Bugs', 'Resolved')"),
  }),
  outputSchema: z.string(),
});

export const createBugTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "create-bug",
  description: "Create a new bug report in the workspace.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/bugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...args,
                workspaceId,
                // We need pageId and teamId. If not provided, the AI should have asked for them or inferred them.
                // For now, we assume they are passed in args.
                reporter: { id: userId, name: "AI User" }, // Ideally need real user name
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Bug created successfully: ${data.data.bugId}`;
    } catch (e: any) {
        return `Error creating bug: ${e.message}`;
    }
  },
  inputSchema: z.object({
    bug: z.string().describe("The title/description of the bug"),
    description: z.string().optional().describe("Detailed description of the bug"),
    teamId: z.string().describe("The ID of the team this bug belongs to"),
    pageId: z.string().describe("The ID of the page this bug belongs to"),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']).default('Medium').describe("Priority of the bug"),
    status: z.string().default('Awaiting Review').describe("Status of the bug"),
  }),
  outputSchema: z.string(),
});

export const updateBugTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "update-bug",
  description: "Update an existing bug.",
  tool: async (args) => {
    try {
        const { id, ...updates } = args;
        const response = await fetch('/api/bugs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Bug updated successfully.`;
    } catch (e: any) {
        return `Error updating bug: ${e.message}`;
    }
  },
  inputSchema: z.object({
    id: z.string().describe("The ID (database ID) of the bug to update"),
    bug: z.string().optional().describe("New title for the bug"),
    status: z.string().optional().describe("New status"),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional().describe("New priority"),
  }),
  outputSchema: z.string(),
});
