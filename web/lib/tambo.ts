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

import type { TamboComponent } from "@tambo-ai/react";


/**
 * Components Array - A collection of Tambo components to register
 * 
 * Components represent UI elements that can be generated or controlled by AI.
 * Register your custom components here to make them available to the AI.
 * 
 * Example of adding a component:
 * 
 * ```typescript
 * import { z } from "zod/v4";
 * import { CustomChart } from "../components/ui/custom-chart";
 * 
 * // Define and add your component
 * export const components: TamboComponent[] = [
 *   {
 *     name: "CustomChart",
 *     description: "Renders a custom chart with the provided data",
 *     component: CustomChart,
 *     propsSchema: z.object({
 *       data: z.array(z.number()),
 *       title: z.string().optional(),
 *     })
 *   }
 * ];
 * ```
 */

import { z } from "zod";
import Clock from "../components/tambo/clock";
import type { TamboTool } from "@tambo-ai/react";

/**
 * Components Array - A collection of Tambo components to register
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
 * Tools Array - A collection of Tambo tools to register
 */
export const tools: TamboTool[] = [
  {
    name: "get-time",
    description: "Get the current time.",
    tool: async () => {
      return new Date().toString();
    },
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
];
