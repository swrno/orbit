import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import type { ToolContext } from "./types";
import type { PageType } from "@/lib/store";

export const getCreateDocumentTool = (context: ToolContext): TamboTool => {
  const { workspaceId, userId, userEmail, workspaces, updatePage, addPage, router } = context;

  return {
    name: "create-document",
    description: "Create a new document page and optionally write content to it.",
    inputSchema: z.object({
      title: z.string().describe("The title of the document"),
      content: z.string().optional().describe("Initial content for the document (HTML/Text)"),
      teamName: z.string().optional().describe("The name of the team to create the document in (defaults to first team)"),
      type: z.string().optional().describe("The type of page (document, board, table, etc.). Defaults to 'document'."),
    }),
    outputSchema: z.string(),
    tool: async ({ title, content, teamName, type }) => {
      if (!workspaces || !addPage || !router) return "Error: Creation unavailable.";
      
      const ws = workspaces.find(w => w.id === workspaceId);
      if (!ws) return "Error: Current workspace not found.";

      let targetTeam = ws.teams[0];
      if (teamName) {
         const found = ws.teams.find(t => t.title.toLowerCase() === teamName.toLowerCase());
         if (found) targetTeam = found;
      }

      if (!targetTeam) return "Error: No team found to create document in.";

      const pageType = (type as PageType) || 'document';
      
      try {
        const newPageId = await addPage(workspaceId, targetTeam.id, title, pageType);
        
        if (content && updatePage) {
           // Immediately update with content
           await updatePage(workspaceId, targetTeam.id, newPageId, { content }, userId, userEmail);
        }

        router.push(`/${workspaceId}/${targetTeam.id}/${newPageId}`);
        return `Created document '${title}' in team '${targetTeam.title}' and opened it.`;
      } catch (error: any) {
        return `Error creating document: ${error.message}`;
      }
    },
  };
};
