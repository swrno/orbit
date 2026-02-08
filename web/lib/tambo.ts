/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 * 
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 * 
 * IMPORTANT: If you have components in different directories (e.g., both ui/ and tambo/),
 * make sure all import paths are consistent. Run 'npx tambo migrate' to consolidate.
 * 
 * Read more about Tambo at https://docs.tambo.co
 */

import { z } from "zod";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";

// Component Imports
import Clock from "../components/tambo/clock";

// Tool Imports
import { 
  getBugsTool, createBugTool, updateBugTool,
  getTasksTool, createTaskTool, updateTaskTool,
  getEpicsTool, createEpicTool, updateEpicTool,
  getRetrosTool, createRetroTool, voteRetroTool,
  addTeamMemberTool, removeTeamMemberTool,
  getSprintsTool, createSprintTool, updateSprintTool
} from "./tools";

/**
 * Components Array - A collection of Tambo components to register
 * 
 * Components represent UI elements that can be generated or controlled by AI.
 * Register your custom components here to make them available to the AI.
 */
export const components: TamboComponent[] = [
  {
    name: "Clock",
    description: "Displays the current time to the user.",
    component: Clock,
    propsSchema: z.object({
      time: z.string().optional().describe("The current time to display, e.g. '10:00 AM'"),
    }),
  },
];

/**
 * Tools Factory - A function to generate Tambo tools with context
 */
export const createTools = (context: { workspaceId: string, userId: string }): TamboTool[] => {
  const { workspaceId, userId } = context;
  return [
    {
      name: "get-time",
      description: "Get the current time.",
      tool: async () => {
        return new Date().toString();
      },
      inputSchema: z.object({}),
      outputSchema: z.string(),
    },
    // Bugs
    getBugsTool(workspaceId, userId),
    createBugTool(workspaceId, userId),
    updateBugTool(workspaceId, userId),
    // Tasks
    getTasksTool(workspaceId, userId),
    createTaskTool(workspaceId, userId),
    updateTaskTool(workspaceId, userId),
    // Epics
    getEpicsTool(workspaceId, userId),
    createEpicTool(workspaceId, userId),
    updateEpicTool(workspaceId, userId),
    // Retros
    getRetrosTool(workspaceId, userId),
    createRetroTool(workspaceId, userId),
    voteRetroTool(workspaceId, userId),
    // Teams
    addTeamMemberTool(workspaceId, userId),
    removeTeamMemberTool(workspaceId, userId),
    // Sprints
    getSprintsTool(workspaceId, userId),
    createSprintTool(workspaceId, userId),
    updateSprintTool(workspaceId, userId),
  ];
};
