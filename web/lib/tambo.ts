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
import type { Workspace, Page, PageType } from "./store";

// Component Imports
import Clock from "../components/tambo/addedComponents/clock";
import {
  CreateBugForm,
  CreateTaskForm,
  CreateEpicForm,
  CreateSprintForm,
  CreateRetroForm,
  AssignBugForm,
} from "../components/tambo/addedComponents";

// Tool Imports
import { getGetTimeTool } from "../components/tambo/tools/get-time";
import { getReadPageTool } from "../components/tambo/tools/read-page";
import { getUpdatePageTool } from "../components/tambo/tools/update-page";
import { getCreateDocumentTool } from "../components/tambo/tools/create-document";
import { getSwitchWorkspaceTool } from "../components/tambo/tools/switch-workspace";
import { getNavigateToPageTool } from "../components/tambo/tools/navigate-to-page";
import { getNavigateToViewTool } from "../components/tambo/tools/navigate-to-view";
import { getRefreshPageTool } from "../components/tambo/tools/refresh-page";
import { getGetCurrentPageInfoTool } from "../components/tambo/tools/get-current-page-info";
import type { ToolContext } from "../components/tambo/tools/types";


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
  // Create Bug Form - renders a form to create a new bug
  {
    name: "CreateBugForm",
    description: "Use this component when the user wants to create a bug. You usually should display this form immediately. If the user provides details (title, priority, etc.), PRE-FILL the form props with those values.",
    component: CreateBugForm,
    propsSchema: z.object({
      bug: z.string().optional().describe("Pre-filled bug title"),
      description: z.string().optional().describe("Pre-filled bug description"),
      dueDate: z.string().optional().describe("Pre-filled due date (YYYY-MM-DD format)"),
      priority: z.string().optional().describe("Pre-selected priority (Critical, High, Medium, Low)"),
      status: z.string().optional().describe("Pre-selected status (Awaiting Review, Pending Review, Ready for Dev, Fixed, Done)"),
      group: z.string().optional().describe("Pre-selected group (Incoming Bugs, Development Work, Resolved)"),
      teamId: z.string().optional().describe("The ID of the team this bug belongs to"),
      pageId: z.string().optional().describe("The ID of the page this bug belongs to"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
  // Assign Bug Form - renders a form to assign a bug
  {
    name: "AssignBugForm",
    description: "Use this component IMMEDIATELY when the user wants to assign a bug or issue. Do NOT ask for details in chat. Render this form to let the user select the bug and assignee.",
    component: AssignBugForm,
    propsSchema: z.object({
      bugId: z.string().optional().describe("Pre-selected bug ID"),
      assigneeId: z.string().optional().describe("Pre-selected assignee user ID"),
      teamId: z.string().optional().describe("The ID of the team"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
  // Create Task Form - renders a form to create a new task
  {
    name: "CreateTaskForm",
    description: "Use this component when the user wants to create a task. You usually should display this form immediately. If the user provides details (task name, sprint, etc.), PRE-FILL the form props with those values.",
    component: CreateTaskForm,
    propsSchema: z.object({
      task: z.string().optional().describe("Pre-filled task name"),
      status: z.string().optional().describe("Pre-selected status (Ready to start, In Progress, Done)"),
      type: z.string().optional().describe("Pre-selected type (Feature, Bug, Other)"),
      estimatedSP: z.number().optional().describe("Pre-filled story points estimate"),
      sprint: z.string().optional().describe("Pre-selected sprint name"),
      epic: z.string().optional().describe("Pre-selected epic name"),
      githubLink: z.string().optional().describe("Pre-filled GitHub link"),
      teamId: z.string().optional().describe("The ID of the team"),
      pageId: z.string().optional().describe("The ID of the page"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
  // Create Epic Form - renders a form to create a new epic
  {
    name: "CreateEpicForm",
    description: "Use this component when the user wants to create an epic. You usually should display this form immediately. If the user provides details, PRE-FILL the form props with those values.",
    component: CreateEpicForm,
    propsSchema: z.object({
      epic: z.string().optional().describe("Pre-filled epic name"),
      description: z.string().optional().describe("Pre-filled epic description"),
      startDate: z.string().optional().describe("Pre-filled start date (YYYY-MM-DD format)"),
      dueDate: z.string().optional().describe("Pre-filled due date (YYYY-MM-DD format)"),
      phase: z.string().optional().describe("Pre-selected phase (Product discovery, Backlog, Dev WIP, etc.)"),
      priority: z.string().optional().describe("Pre-selected priority (Must Have, Critical, Nice to Have)"),
      hierarchy: z.number().optional().describe("Pre-selected hierarchy level (0=Top, 1=Sub, 2=Sub-sub)"),
      teamId: z.string().optional().describe("The ID of the team"),
      pageId: z.string().optional().describe("The ID of the page"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
  // Create Sprint Form - renders a form to create a new sprint
  {
    name: "CreateSprintForm",
    description: "Use this component when the user wants to create a sprint. You usually should display this form immediately. If the user provides details, PRE-FILL the form props with those values.",
    component: CreateSprintForm,
    propsSchema: z.object({
      sprint: z.string().optional().describe("Pre-filled sprint name"),
      sprintGoals: z.string().optional().describe("Pre-filled sprint goals"),
      activeSprintStatus: z.string().optional().describe("Pre-selected status (Planned, Active, Completed)"),
      sprintStartDate: z.string().optional().describe("Pre-filled start date (YYYY-MM-DD format)"),
      sprintEndDate: z.string().optional().describe("Pre-filled end date (YYYY-MM-DD format)"),
      teamId: z.string().optional().describe("The ID of the team"),
      pageId: z.string().optional().describe("The ID of the page"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
  // Create Retro Form - renders a form to create retrospective feedback
  {
    name: "CreateRetroForm",
    description: "Use this component when the user wants to add retrospective feedback. You usually should display this form immediately. If the user provides details, PRE-FILL the form props with those values.",
    component: CreateRetroForm,
    propsSchema: z.object({
      feedback: z.string().optional().describe("Pre-filled feedback text"),
      type: z.string().optional().describe("Pre-selected feedback type (Keep, Improve, Discussion)"),
      sprint: z.string().optional().describe("Pre-filled sprint identifier"),
      repeating: z.boolean().optional().describe("Whether this is a repeating issue"),
      teamId: z.string().optional().describe("The ID of the team"),
      pageId: z.string().optional().describe("The ID of the page"),
      workspaceId: z.string().optional().describe("The workspace ID"),
    }),
  },
];

/**
 * Tools Factory - A function to generate Tambo tools with context
 */
import { getSearchActivitiesTool } from "../components/tambo/tools/search-activities";
import { getFetchDataTool } from "../components/tambo/tools/fetch-data";
import { getListPagesTool } from "../components/tambo/tools/list-pages";
import { getListTeamsTool } from "../components/tambo/tools/list-teams";

/**
 * Tools Factory - A function to generate Tambo tools with context
 */
export const createTools = (context: ToolContext): TamboTool[] => {
  return [
    getGetTimeTool(context),
    getReadPageTool(context),
    getUpdatePageTool(context),
    getCreateDocumentTool(context),
    getSwitchWorkspaceTool(context),
    getNavigateToPageTool(context),
    getNavigateToViewTool(context),
    getGetCurrentPageInfoTool(context),
    getRefreshPageTool(context),
    getSearchActivitiesTool(context),
    getFetchDataTool(context),
    getListPagesTool(context),
    getListTeamsTool(context),
  ];
};
