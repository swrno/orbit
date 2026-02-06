# Orbit AI Workspace

> **AI-First Agile Project Management** - Built with [Tambo AI](https://tambo.co) for intelligent workspace collaboration

Orbit is a modern agile project management platform that combines traditional workflows with AI-powered assistance through Tambo. Manage backlogs, sprints, epics, and bugs while leveraging AI to streamline your team's workflow.

---

## ✨ Features

- **Product Backlog** - Centralized work items with prioritization
- **Sprint Planning** - Time-boxed iterations with velocity tracking
- **Scrum Boards** - Visual workflow with drag-and-drop
- **Epic Management** - Strategic roadmapping and progress tracking  
- **Bug Tracking** - Comprehensive defect management
- **Analytics** - Velocity charts, burndown, and CFD reports
- **AI Assistant** - Powered by **[Tambo](https://docs.tambo.co)**

---

## 🤖 Tambo AI Integration

Orbit extensively integrates **[Tambo](https://tambo.co)** - an AI platform that connects your entire workspace through natural language interactions.

### AI-Powered Capabilities

**Conversational Workspace Control**
- Create tasks, sprints, and epics through natural language
- Navigate between pages using AI commands
- Query workspace data (tasks, team members, sprints)
- Edit documents with AI-assisted markdown generation

**Tambo Components** (`lib/tambo.ts`)
- `WorkspaceCreator` - AI-driven workspace setup
- `TaskCreator/TaskEditor` - Intelligent task management
- `SprintCreator/EpicCreator` - Planning made conversational
- `PageCreator/GroupCreator` - Structure your workspace via AI
- `DocEditor` - AI-powered document editing
- `Navigator` - Natural language navigation
- `TeamList/TeamMemberCreator` - Team management
- `MarkdownEditor` - AI content generation

**Tambo Tools** (`lib/tambo.ts`)
- `get_workspaces` - List all available workspaces
- `create_workspace` - Generate new workspaces
- `update_workspace` - Modify workspace settings
- `delete_workspace` - Remove workspaces
- `get_tasks` - Query tasks with filters
- `get_sprints` - Retrieve sprint information
- `get_epics` - Access epic data
- `get_pages` - Navigate page hierarchy
- `get_team_members` - Team roster access

### Chat Interface

Press **⌘K** (Mac) or **Ctrl+K** (Windows) to open the AI assistant:

```
User: "Create a new task for fixing the login bug"
AI: [Renders TaskCreator component with pre-filled data]

User: "Show me all tasks in the current sprint"
AI: [Uses get_tasks tool to fetch and display results]

User: "Draft a sprint retrospective document"
AI: [Opens MarkdownEditor with AI-generated content]
```

The Tambo assistant is **always available** in the bottom-right corner - it understands your workspace context and can perform actions on your behalf.

---

## 🚀 Quick Start

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## �️ Tech Stack

- **Framework**: Next.js 16 with App Router + Turbopack
- **Language**: TypeScript
- **UI**: Material-UI (MUI) + Lucide Icons
- **State**: Zustand with persistence
- **AI Platform**: **[Tambo](https://docs.tambo.co)** (`@tambo-ai/react` + `@tambo-ai/typescript-sdk`)
- **Styling**: Atlassian Design System (JIRA-inspired)

---

## 📂 Project Structure

```
web/
├── app/
│   ├── [workspaceId]/         # Workspace routes
│   │   ├── backlog/           # Backlog management
│   │   ├── sprints/           # Sprint planning
│   │   ├── epics/             # Epic roadmapping
│   │   ├── bugs/              # Bug tracking
│   │   ├── reports/           # Analytics
│   │   └── team/              # Team management
│   └── page.tsx               # Landing page
├── components/
│   ├── tambo/                 # 🤖 Tambo AI components
│   │   ├── task-components.tsx
│   │   ├── planning-components.tsx
│   │   ├── structure-components.tsx
│   │   ├── team-components.tsx
│   │   ├── workspace-components.tsx
│   │   ├── markdown-editor.tsx
│   │   ├── navigator.tsx
│   │   └── message-thread-collapsible.tsx
│   ├── layout/                # UI structure
│   └── analytics/             # Reports & charts
└── lib/
    ├── tambo.ts               # 🤖 Tambo config & tools
    ├── store.ts               # Zustand state
    └── thread-hooks.ts        # Tambo thread management
```

---

## 🤖 Extending Tambo Integration

### Adding New Components

```typescript
// lib/tambo.ts
export const components: TamboComponent[] = [
  {
    name: "MyCustomComponent",
    description: "Your component description for AI",
    component: MyCustomComponent,
    propsSchema: z.object({
      myProp: z.string().describe("What this prop does")
    }),
  },
  // ... existing components
];
```

### Adding New Tools

```typescript
// lib/tambo.ts
export const tools: TamboTool[] = [
  {
    name: "my_custom_action",
    description: "What this action does",
    tool: async ({ input }) => {
      const state = useAppStore.getState();
      // Your logic here
      return result;
    },
    inputSchema: z.object({ input: z.string() }),
    outputSchema: z.string(),
  },
  // ... existing tools
];
```

Learn more: **[Tambo Documentation](https://docs.tambo.co)**

---

## 🎯 Why Tambo?

Traditional project management tools require clicking through menus and forms. **Tambo** lets you:

- ✅ **Work naturally** - Just describe what you want in plain English
- ✅ **Save time** - AI handles repetitive tasks automatically
- ✅ **Stay in flow** - No context switching between tools
- ✅ **Extend easily** - Add custom components and tools

**Example**: Instead of:
1. Click "Create Task"
2. Fill in title field
3. Fill in description field
4. Select assignee from dropdown
5. Click "Save"

Just say: *"Create a task for implementing authentication and assign it to Sarah"*

---

## 📖 Learn More

- **Tambo Docs**: [https://docs.tambo.co](https://docs.tambo.co)
- **Tambo React**: [@tambo-ai/react](https://www.npmjs.com/package/@tambo-ai/react)
- **Tambo SDK**: [@tambo-ai/typescript-sdk](https://www.npmjs.com/package/@tambo-ai/typescript-sdk)

---

## 📝 Environment Variables

```bash
# web/.env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

Get your API key at [tambo.co](https://tambo.co)

---

## � Deployment

Optimized for **Vercel** with configuration in `web/vercel.json`:

```bash
vercel deploy
```

---

## � License

MIT License - Free to use and modify

---

**Built with ❤️ and [Tambo AI](https://tambo.co)** - Making project management intelligent and conversational.
