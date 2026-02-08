import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const getTasksTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "get-tasks",
  description: "Fetch tasks from the workspace. Can filter by team, page, status, sprint, or group.",
  tool: async (args) => {
    const params = new URLSearchParams({ workspaceId });
    if (args.teamId) params.append("teamId", args.teamId);
    if (args.pageId) params.append("pageId", args.pageId);
    if (args.sprint) params.append("sprint", args.sprint);
    if (args.group) params.append("group", args.group);
    
    try {
        const response = await fetch(`/api/tasks?${params.toString()}`);
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return JSON.stringify(data.data);
    } catch (e: any) {
        return `Error fetching tasks: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().optional().describe("The ID of the team"),
    pageId: z.string().optional().describe("The ID of the page"),
    sprint: z.string().optional().describe("Filter by sprint (e.g., 'Sprint 1', 'Backlog')"),
    group: z.string().optional().describe("Filter by group"),
  }),
  outputSchema: z.string(),
});

export const createTaskTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "create-task",
  description: "Create a new task.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...args,
                workspaceId,
                owner: { id: userId, name: "AI User" }, // Placeholder for now
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Task created successfully: ${data.data.taskId}`;
    } catch (e: any) {
        return `Error creating task: ${e.message}`;
    }
  },
  inputSchema: z.object({
    task: z.string().describe("The task title"),
    description: z.string().optional().describe("Task description"),
    teamId: z.string().describe("The ID of the team"),
    pageId: z.string().describe("The ID of the page"),
    status: z.string().default('Ready to start').describe("Status of the task"),
    type: z.string().default('Feature').describe("Type of task (Feature, Bug, Other)"),
    estimatedSP: z.number().optional().describe("Estimated Story Points"),
    sprint: z.string().optional().describe("Sprint to assign the task to (e.g., 'Sprint 1')"),
  }),
  outputSchema: z.string(),
});

export const updateTaskTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "update-task",
  description: "Update an existing task.",
  tool: async (args) => {
    try {
        const { id, ...updates } = args;
        const response = await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: id, updates }) // Note: API expects taskId and updates object
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Task updated successfully.`;
    } catch (e: any) {
        return `Error updating task: ${e.message}`;
    }
  },
  inputSchema: z.object({
    id: z.string().describe("The ID (database ID) of the task to update"),
    task: z.string().optional().describe("New title"),
    status: z.string().optional().describe("New status"),
    type: z.string().optional().describe("New type"),
    estimatedSP: z.number().optional().describe("New SP estimate"),
    sprint: z.string().optional().describe("Sprint name"),
  }),
  outputSchema: z.string(),
});
