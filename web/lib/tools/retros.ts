import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const getRetrosTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "get-retros",
  description: "Fetch retrospective items from the workspace.",
  tool: async (args) => {
    const params = new URLSearchParams({ workspaceId });
    if (args.teamId) params.append("teamId", args.teamId);
    if (args.pageId) params.append("pageId", args.pageId);
    if (args.sprint) params.append("sprint", args.sprint);
    
    try {
        const response = await fetch(`/api/retrospectives?${params.toString()}`);
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return JSON.stringify(data.data);
    } catch (e: any) {
        return `Error fetching retrospectives: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().optional().describe("The ID of the team"),
    pageId: z.string().optional().describe("The ID of the page"),
    sprint: z.string().optional().describe("The sprint identifier (e.g., 'Sprint 1')"),
  }),
  outputSchema: z.string(),
});

export const createRetroTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "create-retro",
  description: "Create a new retrospective feedback item.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/retrospectives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...args,
                workspaceId,
                submitter: { id: userId, name: "AI User" },
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Retrospective item created successfully.`;
    } catch (e: any) {
        return `Error creating retrospective item: ${e.message}`;
    }
  },
  inputSchema: z.object({
    feedback: z.string().describe("The feedback text"),
    type: z.enum(['Keep', 'Improve', 'Discussion']).describe("Type of feedback"),
    teamId: z.string().describe("The ID of the team"),
    pageId: z.string().describe("The ID of the page"),
    sprint: z.string().describe("The sprint identifier (e.g., 'Sprint 1')"),
    repeating: z.boolean().optional().describe("Is this a repeating issue?"),
  }),
  outputSchema: z.string(),
});

export const voteRetroTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "vote-retro",
  description: "Vote on a retrospective item.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/retrospectives', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: args.id, incrementVote: true })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Voted successfully.`;
    } catch (e: any) {
        return `Error voting: ${e.message}`;
    }
  },
  inputSchema: z.object({
    id: z.string().describe("The ID of the retro item to vote on"),
  }),
  outputSchema: z.string(),
});
