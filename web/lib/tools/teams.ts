import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

export const addTeamMemberTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "add-team-member",
  description: "Add a user to a team.",
  tool: async (args) => {
    try {
        const response = await fetch('/api/teams/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId, // Simulated auth header
            },
            body: JSON.stringify({
                workspaceId,
                teamId: args.teamId,
                userId: args.email, // Using email as ID for compatibility with View
                email: args.email,
                name: args.name,
                teamRole: args.role,
                currentUserId: userId
            })
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Team member added successfully.`;
    } catch (e: any) {
        return `Error adding team member: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().describe("The ID of the team"),
    email: z.string().email().describe("Email of the user to add"),
    name: z.string().describe("Name of the user"),
    role: z.enum(['LEADER', 'EDITOR', 'VIEWER']).default('VIEWER').describe("Role in the team"),
  }),
  outputSchema: z.string(),
});

export const removeTeamMemberTool = (workspaceId: string, userId: string): TamboTool => ({
  name: "remove-team-member",
  description: "Remove a user from a team.",
  tool: async (args) => {
    try {
        const response = await fetch(`/api/teams/members?workspaceId=${workspaceId}&teamId=${args.teamId}&userId=${args.userId}&currentUserId=${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId,
            }
        });
        const data = await response.json();
        if(!data.success) throw new Error(data.error);
        return `Team member removed successfully.`;
    } catch (e: any) {
        return `Error removing team member: ${e.message}`;
    }
  },
  inputSchema: z.object({
    teamId: z.string().describe("The ID of the team"),
    userId: z.string().describe("The ID (or email) of the user to remove"),
  }),
  outputSchema: z.string(),
});
