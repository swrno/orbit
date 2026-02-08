import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const getSprintsTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "get-sprints",
  description: "Fetch sprints from the workspace.",
  tool: async (args) => {
    const params = new URLSearchParams({ workspaceId });
    if (args.teamId) params.append("teamId", args.teamId);
    if (args.pageId) params.append("pageId", args.pageId);
    
    try {
        const response = await fetch(`/api/sprints?${params.toString()}`);
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return JSON.stringify(data.data);
    } catch (e: any) {
        return `Error fetching sprints: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().optional().describe("The ID of the team"),
    pageId: z.string().optional().describe("The ID of the page"),
  }),
  outputSchema: z.string(),
});

export const createSprintTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "create-sprint",
  description: "Create a new sprint.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/sprints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...args,
                workspaceId: args.workspaceId || workspaceId,
                owner: { id: userId, name: "AI User" },
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Sprint created successfully: ${data.data.sprint}`;
    } catch (e: any) {
        return `Error creating sprint: ${e.message}`;
    }
  },
  inputSchema: z.object({
    sprint: z.string().describe("The sprint name (e.g., 'Sprint 5')"),
    sprintGoals: z.string().optional().describe("Goals for the sprint"),
    teamId: z.string().describe("The ID of the team"),
    pageId: z.string().describe("The ID of the page"),
    sprintStartDate: z.string().describe("Start date (ISO string)"),
    sprintEndDate: z.string().describe("End date (ISO string)"),
    activeSprintStatus: z.enum(['Active', 'Planned', 'Completed']).default('Planned').describe("Status"),
    workspaceId: z.string().optional().describe("Override workspace ID"),
  }),
  outputSchema: z.string(),
});

export const updateSprintTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "update-sprint",
  description: "Update an existing sprint.",
  tool: async (args) => {
    try {
        const { id, ...updates } = args;
        const response = await fetch('/api/sprints', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Sprint updated successfully.`;
    } catch (e: any) {
        return `Error updating sprint: ${e.message}`;
    }
  },
  inputSchema: z.object({
    id: z.string().describe("The ID (database ID) of the sprint to update"),
    sprint: z.string().optional().describe("New name"),
    sprintGoals: z.string().optional().describe("New goals"),
    activeSprintStatus: z.enum(['Active', 'Planned', 'Completed']).optional().describe("New status"),
    sprintStartDate: z.string().optional().describe("New start date (ISO string)"),
    sprintEndDate: z.string().optional().describe("New end date (ISO string)"),
  }),
  outputSchema: z.string(),
});
