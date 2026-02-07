"use client";

/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 * 
 * This file registers Tambo components and tools for AI-driven workspace management.
 * All components are designed to work with MongoDB backend and current schema structure.
 * 
 * Read more about Tambo at https://docs.tambo.co
 */

import { WorkspaceCreator } from "@/components/tambo/workspace-creator";
import { TaskCreator } from "@/components/tambo/task-creator";
import { SprintCreator } from "@/components/tambo/sprint-creator";

import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Components Array - MongoDB-based workspace management components
 * 
 * These components work with the MongoDB API for data persistence.
 */
export const components: TamboComponent[] = [
  {
    name: "WorkspaceCreator",
    description: "Create a new workspace. Workspaces are managed client-side and organize your teams and projects.",
    component: WorkspaceCreator,
    propsSchema: z.object({
      defaultName: z.string().optional().describe("Default name for the workspace"),
      onSuccess: z.any().optional().describe("Callback function when workspace is created"),
    }),
  },
  {
    name: "TaskCreator",
    description: "Create a new task in MongoDB. Requires workspaceId, teamId, and pageId. Tasks are persisted in the database.",
    component: TaskCreator,
    propsSchema: z.object({
      defaultTitle: z.string().optional().describe("Default title for the task"),
      defaultDescription: z.string().optional().describe("Default description"),
      workspaceId: z.string().describe("The workspace ID this task belongs to"),
      teamId: z.string().describe("The team ID this task belongs to"),
      pageId: z.string().describe("The page ID this task belongs to"),
      workspaceKey: z.string().optional().describe("Workspace key for task IDs (e.g., PROJ)"),
      onSuccess: z.any().optional().describe("Callback function when task is created"),
    }),
  },
  {
    name: "SprintCreator",
    description: "Create a new sprint in MongoDB. Requires workspaceId, teamId, and pageId. Sprints are persisted in the database.",
    component: SprintCreator,
    propsSchema: z.object({
      defaultName: z.string().optional().describe("Default name for the sprint"),
      workspaceId: z.string().describe("The workspace ID this sprint belongs to"),
      teamId: z.string().describe("The team ID this sprint belongs to"),
      pageId: z.string().describe("The page ID this sprint belongs to"),
      onSuccess: z.any().optional().describe("Callback function when sprint is created"),
    }),
  },
];

/**
 * Tools Array - API-based actions for workspace management
 * 
 * These tools interact with MongoDB via API routes.
 */
export const tools: TamboTool[] = [
  {
    name: "get_tasks",
    description: "Fetch tasks from MongoDB. Filter by workspaceId, teamId, or pageId.",
    tool: async ({ workspaceId, teamId, pageId }: { workspaceId?: string; teamId?: string; pageId?: string }) => {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (teamId) params.append('teamId', teamId);
      if (pageId) params.append('pageId', pageId);
      
      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      
      return data.data;
    },
    inputSchema: z.object({
      workspaceId: z.string().optional().describe("Filter by workspace ID"),
      teamId: z.string().optional().describe("Filter by team ID"),
      pageId: z.string().optional().describe("Filter by page ID"),
    }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "get_sprints",
    description: "Fetch sprints from MongoDB. Filter by workspaceId, teamId, or pageId.",
    tool: async ({ workspaceId, teamId, pageId }: { workspaceId?: string; teamId?: string; pageId?: string }) => {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (teamId) params.append('teamId', teamId);
      if (pageId) params.append('pageId', pageId);
      
      const response = await fetch(`/api/sprints?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sprints');
      }
      
      return data.data;
    },
    inputSchema: z.object({
      workspaceId: z.string().optional().describe("Filter by workspace ID"),
      teamId: z.string().optional().describe("Filter by team ID"),
      pageId: z.string().optional().describe("Filter by page ID"),
    }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "get_bugs",
    description: "Fetch bugs from MongoDB. Filter by workspaceId, teamId, or pageId.",
    tool: async ({ workspaceId, teamId, pageId }: { workspaceId?: string; teamId?: string; pageId?: string }) => {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (teamId) params.append('teamId', teamId);
      if (pageId) params.append('pageId', pageId);
      
      const response = await fetch(`/api/bugs?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bugs');
      }
      
      return data.data;
    },
    inputSchema: z.object({
      workspaceId: z.string().optional().describe("Filter by workspace ID"),
      teamId: z.string().optional().describe("Filter by team ID"),
      pageId: z.string().optional().describe("Filter by page ID"),
    }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "get_epics",
    description: "Fetch epics from MongoDB. Filter by workspaceId, teamId, or pageId.",
    tool: async ({ workspaceId, teamId, pageId }: { workspaceId?: string; teamId?: string; pageId?: string }) => {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (teamId) params.append('teamId', teamId);
      if (pageId) params.append('pageId', pageId);
      
      const response = await fetch(`/api/epics?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch epics');
      }
      
      return data.data;
    },
    inputSchema: z.object({
      workspaceId: z.string().optional().describe("Filter by workspace ID"),
      teamId: z.string().optional().describe("Filter by team ID"),
      pageId: z.string().optional().describe("Filter by page ID"),
    }),
    outputSchema: z.array(z.any()),
  },
];

