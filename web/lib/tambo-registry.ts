import { z } from "zod";
import { BoardView } from "@/components/views/BoardView";
import { DataGrid } from "@/components/views/DataGrid";
import { AIForm } from "@/components/views/AIForm";

export const tamboRegistry = [
  { 
    name: "board_view", 
    component: BoardView,
    description: "A Kanban board for task management. Use this for 'show me tasks', 'project status', or 'sprint view'.",
    propsSchema: z.object({})
  },
  { 
    name: "data_grid", 
    component: DataGrid,
    description: "A spreadsheet-like table. Use this for 'list view', 'database', or high-density data.",
    propsSchema: z.object({})
  },
  { 
    name: "ai_form", 
    component: AIForm,
    description: "A generative form. Use this when the user wants to 'create', 'report', or 'input' detailed information.",
    propsSchema: z.object({})
  },
];
