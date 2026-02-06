"use client";

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

import { WorkspaceCreator } from "@/components/tambo/workspace-creator";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { useAppStore } from "@/lib/store";

/**
 * Components Array - A collection of Tambo components to register
 * 
 * Components represent UI elements that can be generated or controlled by AI.
 * Register your custom components here to make them available to the AI.
 */
export const components: TamboComponent[] = [
  {
    name: "WorkspaceCreator",
    description: "A form to create a new workspace. Use this when the user wants to create a new workspace.",
    component: WorkspaceCreator,
    propsSchema: z.object({
      defaultName: z.string().optional().describe("Default name for the workspace if user mentioned one"),
    }),
  }
];

/**
 * Tools Array - A collection of Tambo tools to register
 * 
 * Tools allow the AI to perform actions or retrieve data from your application.
 */
export const tools: TamboTool[] = [
  {
    name: "get_workspaces",
    description: "Get a list of all workspaces. Use this to see available workspaces.",
    tool: async () => {
      const workspaces = useAppStore.getState().workspaces;
      return workspaces.map(w => ({
        id: w.id,
        title: w.title,
        key: w.key,
        plan: w.plan
      }));
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      key: z.string(),
      plan: z.string()
    })),
  },
  {
    name: "create_workspace",
    description: "Create a new workspace with the given title.",
    tool: async ({ title }: { title: string }) => {
      useAppStore.getState().createWorkspace(title);
      return `Workspace "${title}" created successfully.`;
    },
    inputSchema: z.object({
      title: z.string().describe("The name/title of the new workspace"),
    }),
    outputSchema: z.string(),
  },
  {
    name: "update_workspace",
    description: "Update an existing workspace's details like title or plan.",
    tool: async ({ id, title, plan }: { id: string; title?: string; plan?: 'Free' | 'Pro' }) => {
      const updates: any = {};
      if (title) updates.title = title;
      if (plan) updates.plan = plan;
      
      useAppStore.getState().updateWorkspace(id, updates);
      return `Workspace ${id} updated successfully.`;
    },
    inputSchema: z.object({
      id: z.string().describe("The ID of the workspace to update"),
      title: z.string().optional().describe("New title for the workspace"),
      plan: z.enum(['Free', 'Pro']).optional().describe("New plan for the workspace"),
    }),
    outputSchema: z.string(),
  },
  {
    name: "delete_workspace",
    description: "Delete a workspace by its ID.",
    tool: async ({ id }: { id: string }) => {
      useAppStore.getState().deleteWorkspace(id);
      return `Workspace ${id} deleted successfully.`;
    },
    inputSchema: z.object({
      id: z.string().describe("The ID of the workspace to delete"),
    }),
    outputSchema: z.string(),
  },
];

