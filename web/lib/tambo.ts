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
import { TaskCreator, TaskCard, TaskEditor, BugReporter } from "@/components/tambo/task-components";
import { SprintCreator, SprintCard, EpicCreator, EpicCard } from "@/components/tambo/planning-components";
import { PageCreator, GroupCreator, DocEditor } from "@/components/tambo/structure-components";
import { Navigator } from "@/components/tambo/navigator";
import { TeamList, TeamMemberCreator, TeamMemberCard } from "@/components/tambo/team-components";
import { WorkspaceList, WorkspaceCard } from "@/components/tambo/workspace-components";
import { WorkspaceSelector } from "@/components/tambo/workspace-selector";
import { MarkdownEditor } from "@/components/tambo/markdown-editor";
import { Clock, Stopwatch, CountdownTimer } from "@/components/tambo/clock-components";

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
  },
  {
    name: "TaskCreator",
    description: "A form to create a new task. Use this when user wants to add a task.",
    component: TaskCreator,
    propsSchema: z.object({
      defaultTitle: z.string().optional().describe("Default title for the task"),
      defaultDescription: z.string().optional().describe("Default description for the task"),
    }),
  },
  {
    name: "BugReporter",
    description: "A form to report a bug. Use this when user wants to report a bug or an issue. This component includes fields for reporter and assignee.",
    component: BugReporter,
    propsSchema: z.object({
      defaultTitle: z.string().optional().describe("Default title for the bug"),
      defaultDescription: z.string().optional().describe("Default description for the bug"),
    }),
  },
  {
    name: "TaskCard",
    description: "A card displaying task details. Use this to show a task to the user.",
    component: TaskCard,
    propsSchema: z.object({
      task: z.any().describe("The task object to display"), // We use any here for simplicity in crossing the serial boundary, effectively passing JSON
    }),
  },
  {
    name: "TaskEditor",
    description: "A form to edit an existing task. Use this when user wants to modify a task.",
    component: TaskEditor,
    propsSchema: z.object({
      taskId: z.string().describe("The ID or Key of the task to edit"),
    }),
  },
  {
    name: "SprintCreator",
    description: "A form to create a new sprint.",
    component: SprintCreator,
    propsSchema: z.object({
      defaultName: z.string().optional()
    }),
  },
  {
    name: "SprintCard",
    description: "Displays sprint details.",
    component: SprintCard,
    propsSchema: z.object({
      sprint: z.any()
    }),
  },
  {
    name: "EpicCreator",
    description: "A form to create a new epic.",
    component: EpicCreator,
    propsSchema: z.object({}),
  },
  {
    name: "EpicCard",
    description: "Displays epic details.",
    component: EpicCard,
    propsSchema: z.object({
      epic: z.any()
    }),
  },
  {
    name: "PageCreator",
    description: "A form to create a new page in the workspace.",
    component: PageCreator,
    propsSchema: z.object({
      defaultTitle: z.string().optional()
    }),
  },
  {
    name: "GroupCreator",
    description: "A form to create a new group/folder.",
    component: GroupCreator,
    propsSchema: z.object({}),
  },
  {
    name: "DocEditor",
    description: "A form to edit the content of a document page. Use this when the user wants to write or edit a doc.",
    component: DocEditor,
    propsSchema: z.object({
      pageId: z.string().optional().describe("The ID of the page/document to edit. If not provided, will ask user to select."),
    }),
  },
  {
    name: "navigate",
    description: "Navigate the user to a specific page or view. Use this to change the current screen.",
    component: Navigator,
    propsSchema: z.object({
      path: z.string().describe("The path to navigate to (e.g., 'backlog', 'sprints', 'roadmap', or a page ID)."),
      isAbsolute: z.boolean().optional().describe("Set to true if providing a full URL path. Default false (relative to workspace)."),
    }),
  },
  {
    name: "TeamList",
    description: "Show a list of all team members in the current workspace.",
    component: TeamList,
    propsSchema: z.object({}),
  },
  {
    name: "TeamMemberCreator",
    description: "A form to add a new team member to the workspace.",
    component: TeamMemberCreator,
    propsSchema: z.object({
      defaultName: z.string().optional(),
      defaultEmail: z.string().optional(),
    }),
  },
  {
    name: "TeamMemberCard",
    description: "Show details card for a specific team member.",
    component: TeamMemberCard,
    propsSchema: z.object({
      memberId: z.string().describe("The ID of the team member to show."),
    }),
  },
  {
    name: "WorkspaceSelector",
    description: "A dropdown selector to choose between different workspaces. Use this when the user wants to select or switch between workspaces. The component handles workspace switching internally.",
    component: WorkspaceSelector,
    propsSchema: z.object({
      label: z.string().optional().describe("Label for the selector (default: 'Workspace')"),
    }),
  },
  {
    name: "WorkspaceList",
    description: "Show a list of all workspaces available to the user.",
    component: WorkspaceList,
    propsSchema: z.object({}),
  },
  {
    name: "WorkspaceCard",
    description: "Show details card for a specific workspace.",
    component: WorkspaceCard,
    propsSchema: z.object({
      workspaceId: z.string().describe("The ID of the workspace to show."),
    }),
  },
  {
    name: "MarkdownEditor",
    description: "An AI-powered document editor that supports Markdown. Use this when the user needs to write, view, or draft content/docs in the chat (AI generation supported).",
    component: MarkdownEditor,
    propsSchema: z.object({
      initialContent: z.string().optional().describe("The content of the document. If the user asks you to write, draft, or generate text, you MUST generate the markdown content yourself and pass it here. Do not return an empty string if the user asked for content."),
      title: z.string().optional().describe("Title of the document/draft."),
    }),
  },
  {
    name: "Clock",
    description: "Display a digital clock showing the current time. Use this when the user wants to see the current time, check what time it is, or display a clock.",
    component: Clock,
    propsSchema: z.object({
      timezone: z.string().optional().describe("The timezone to display (default: 'Asia/Kolkata'). Common values: 'America/New_York', 'Europe/London', 'Asia/Tokyo', etc."),
      format24h: z.boolean().optional().describe("Whether to use 24-hour format (default: true)"),
      showSeconds: z.boolean().optional().describe("Whether to show seconds (default: true)"),
      showDate: z.boolean().optional().describe("Whether to show the date (default: true)"),
    }),
  },
  {
    name: "Stopwatch",
    description: "A stopwatch component for timing activities. Use this when the user wants to time something, measure duration, or track elapsed time. Supports lap times.",
    component: Stopwatch,
    propsSchema: z.object({
      autoStart: z.boolean().optional().describe("Whether to automatically start the stopwatch (default: false)"),
    }),
  },
  {
    name: "CountdownTimer",
    description: "A countdown timer component. Use this when the user wants to set a timer, countdown from a specific duration, or track remaining time.",
    component: CountdownTimer,
    propsSchema: z.object({
      initialMinutes: z.number().optional().describe("Initial minutes for the countdown (default: 5)"),
      initialSeconds: z.number().optional().describe("Initial seconds for the countdown (default: 0)"),
    }),
  },
];

/**
 * Tools Array - A collection of Tambo tools to register
 * 
 * Tools allow the AI to perform actions or retrieve data from your application.
 */
export const tools: TamboTool[] = [
  {
    name: "get_team_members",
    description: "Get a list of all team members in the current workspace.",
    tool: async () => {
      // Lazy access to store to avoid module-level initialization issues
      const state = useAppStore.getState();
      const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
      return workspace?.teamMembers.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role
      })) || [];
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string()
    })),
  },
  {
    name: "get_workspaces",
    description: "Get a list of all workspaces.",
    tool: async () => {
      // Lazy access to store to avoid module-level initialization issues
      const state = useAppStore.getState();
      return state.workspaces.map(w => ({
        id: w.id,
        name: w.name,
        key: w.key,
        plan: w.plan
      }));
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
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
  {
    name: "get_pages",
    description: "Get a list of all pages in the current workspace to find their IDs.",
    tool: async () => {
      const state = useAppStore.getState();
      const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
      if (!workspace) return [];

      const pages: any[] = [];
      workspace.groups.forEach(group => {
        group.pages.forEach(page => {
          pages.push({
            id: page.id,
            title: page.title,
            type: page.type,
            groupTitle: group.title,
            groupId: group.id
          });
        });
      });
      return pages;
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      groupTitle: z.string(),
      groupId: z.string()
    })),
  },
  {
    name: "get_tasks",
    description: "Get a list of tasks for the current workspace, optionally filtered by status or assignee.",
    tool: async ({ status, assignee }: { status?: string; assignee?: string }) => {
      const state = useAppStore.getState();
      const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
      if (!workspace) return [];

      let tasks = workspace.tasks;
      if (status) tasks = tasks.filter(t => t.status === status);
      if (assignee) tasks = tasks.filter(t => t.owner === assignee);

      return tasks.map(t => ({
        id: t.id,
        key: t.key,
        title: t.title,
        status: t.status,
        priority: t.priority,
        owner: t.owner
      }));
    },
    inputSchema: z.object({
      status: z.string().optional(),
      assignee: z.string().optional()
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      key: z.string(),
      title: z.string(),
      status: z.string(),
      priority: z.string().optional(),
      owner: z.string().optional()
    })),
  },
  {
    name: "get_sprints",
    description: "Get a list of sprints for the current workspace.",
    tool: async () => {
      const state = useAppStore.getState();
      const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
      return workspace?.sprints.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        goal: s.goal
      })) || [];
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      goal: z.string().optional()
    })),
  },
  {
    name: "get_epics",
    description: "Get a list of epics for the current workspace.",
    tool: async () => {
      const state = useAppStore.getState();
      const workspace = state.workspaces.find(w => w.id === state.currentWorkspaceId);
      return workspace?.epics.map(e => ({
        id: e.id,
        key: e.key,
        name: e.name,
        status: e.status
      })) || [];
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      key: z.string(),
      name: z.string(),
      status: z.string()
    })),
  }
];
