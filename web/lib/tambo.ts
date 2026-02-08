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
import BugList from "@/components/tambo/generative/BugList";
import TaskList from "@/components/tambo/generative/TaskList";
import EpicList from "@/components/tambo/generative/EpicList";
import RetroList from "@/components/tambo/generative/RetroList";
import TeamAccessList from "@/components/tambo/generative/TeamAccessList";
import CreateBugForm from "@/components/tambo/generative/CreateBugForm";
import CreateTaskForm from "@/components/tambo/generative/CreateTaskForm";
import CreateEpicForm from "@/components/tambo/generative/CreateEpicForm";
import CreateRetroForm from "@/components/tambo/generative/CreateRetroForm";
import CreateSprintForm from "@/components/tambo/generative/CreateSprintForm";

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
  {
    name: "BugList",
    description: "Displays a list of bugs.",
    component: BugList,
    propsSchema: z.object({
      bugs: z.array(z.object({
        id: z.string().optional().nullable(),
        _id: z.string().optional().nullable(),
        bug: z.string().optional().nullable(),
        status: z.string().optional().nullable(),
        priority: z.string().optional().nullable(),
        reporter: z.object({ name: z.string().optional().nullable() }).optional().nullable(),
      })).describe("List of bugs to display"),
    }),
  },
  {
    name: "TaskList",
    description: "Displays a list of tasks.",
    component: TaskList,
    propsSchema: z.object({
        tasks: z.array(z.object({
            id: z.string().optional().nullable(),
            _id: z.string().optional().nullable(),
            task: z.string().optional().nullable(),
            status: z.string().optional().nullable(),
            type: z.string().optional().nullable(),
            estimatedSP: z.number().optional().nullable(),
            sprint: z.string().optional().nullable(),
        })).describe("List of tasks to display"),
    }),
  },
  {
      name: "EpicList",
      description: "Displays a list of epics.",
      component: EpicList,
      propsSchema: z.object({
          epics: z.array(z.object({
              id: z.string().optional().nullable(),
              _id: z.string().optional().nullable(),
              epic: z.string().optional().nullable(),
              status: z.string().optional().nullable(),
              priority: z.string().optional().nullable(),
              progress: z.number().optional().nullable(),
              startDate: z.string().optional().nullable(),
              endDate: z.string().optional().nullable(),
          })).describe("List of epics to display"),
      }),
  },
  {
      name: "RetroList",
      description: "Displays a list of retrospective items.",
      component: RetroList,
      propsSchema: z.object({
          retros: z.array(z.object({
              id: z.string().optional().nullable(),
              _id: z.string().optional().nullable(),
              feedback: z.string().optional().nullable(),
              type: z.string().optional().nullable(),
              repeating: z.boolean().optional().nullable(),
              vote: z.number().optional().nullable(),
              submitter: z.object({ name: z.string().optional().nullable() }).optional().nullable(),
          })).describe("List of retrospective items to display"),
      }),
  },
  {
      name: "TeamAccessList",
      description: "Displays a list of team members.",
      component: TeamAccessList,
      propsSchema: z.object({
          members: z.array(z.object({
              id: z.string().optional().nullable(),
              name: z.string().optional().nullable(),
              email: z.string().optional().nullable(),
              role: z.string().optional().nullable(),
              teamRole: z.string().optional().nullable(),
              avatar: z.string().optional().nullable(),
          })).describe("List of team members"),
          teamName: z.string().optional().nullable(),
          teamId: z.string().optional().nullable(),
      }),
  },
  {
      name: "CreateBugForm",
      description: "Form to create a new bug.",
      component: CreateBugForm,
      propsSchema: z.object({
          teamId: z.string().optional().describe("Team ID"),
          pageId: z.string().optional().describe("Page ID"),
      }),
  },
  {
      name: "CreateTaskForm",
      description: "Form to create a new task.",
      component: CreateTaskForm,
      propsSchema: z.object({
          teamId: z.string().optional().describe("Team ID"),
          pageId: z.string().optional().describe("Page ID"),
          sprint: z.string().optional().describe("Default sprint (e.g., 'Sprint 1')"),
      }),
  },
  {
      name: "CreateEpicForm",
      description: "Form to create a new epic.",
      component: CreateEpicForm,
      propsSchema: z.object({
          teamId: z.string().optional().describe("Team ID"),
          pageId: z.string().optional().describe("Page ID"),
      }),
  },
  {
      name: "CreateRetroForm",
      description: "Form to capture retrospective feedback.",
      component: CreateRetroForm,
      propsSchema: z.object({
          teamId: z.string().optional().describe("Team ID"),
          pageId: z.string().optional().describe("Page ID"),
          sprint: z.string().optional().describe("Default sprint"),
      }),
  },
  {
      name: "CreateSprintForm",
      description: "Form to create a new sprint.",
      component: CreateSprintForm,
      propsSchema: z.object({
          teamId: z.string().optional().describe("Team ID"),
          pageId: z.string().optional().describe("Page ID"),
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
