import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const getEpicsTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "get-epics",
  description: "Fetch epics from the workspace.",
  tool: async (args) => {
    const params = new URLSearchParams({ workspaceId });
    if (args.teamId) params.append("teamId", args.teamId);
    if (args.pageId) params.append("pageId", args.pageId);
    
    try {
        const response = await fetch(`/api/epics?${params.toString()}`);
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return JSON.stringify(data.data);
    } catch (e: any) {
        return `Error fetching epics: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().optional().describe("The ID of the team"),
    pageId: z.string().optional().describe("The ID of the page"),
  }),
  outputSchema: z.string(),
});

export const createEpicTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "create-epic",
  description: "Create a new epic.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/epics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...args,
                workspaceId,
                owner: { id: userId, name: "AI User" },
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Epic created successfully: ${data.data.epicId}`;
    } catch (e: any) {
        return `Error creating epic: ${e.message}`;
    }
  },
  inputSchema: z.object({
    epic: z.string().describe("The epic title"),
    description: z.string().optional().describe("Epic description"),
    teamId: z.string().describe("The ID of the team"),
    pageId: z.string().describe("The ID of the page"),
    status: z.string().default('Not Started').describe("Status"),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium').describe("Priority"),
    startDate: z.string().optional().describe("Start date (ISO string)"),
    endDate: z.string().optional().describe("End date (ISO string)"),
  }),
  outputSchema: z.string(),
});

export const updateEpicTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "update-epic",
  description: "Update an existing epic.",
  tool: async (args) => {
    try {
        const { id, ...updates } = args;
        const response = await fetch('/api/epics', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Epic updated successfully.`;
    } catch (e: any) {
        return `Error updating epic: ${e.message}`;
    }
  },
  inputSchema: z.object({
    id: z.string().describe("The ID (database ID) of the epic to update"),
    epic: z.string().optional().describe("New title"),
    status: z.string().optional().describe("New status"),
    priority: z.string().optional().describe("New priority"),
    progress: z.number().optional().describe("Progress percentage (0-100)"),
  }),
  outputSchema: z.string(),
});
