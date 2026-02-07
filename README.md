# Orbit AI Workspace

**Orbit** is an intelligent team collaboration platform that reimagines project management by embedding AI at its core. Built for modern development teams, Orbit combines the structure of traditional project management tools with the power of conversational AI, enabling you to manage tasks, sprints, and documentation through natural language interactions.

## What is Orbit? 

Orbit is a workspace management system designed to streamline how teams plan, track, and deliver software projects. Unlike conventional tools that require navigating through multiple screens and forms, Orbit lets you interact with your workspace conversationally while maintaining the full power of structured project management.

**Core capabilities include:**
- Task and issue tracking with customizable workflows
- Sprint planning and epic management
- AI-powered document creation and editing
- Team collaboration and workspace organization
- Real-time data visualization and reporting

## Powered by Tambo AI

At the heart of Orbit lies [Tambo](https://docs.tambo.co), an advanced AI framework that transforms how users interact with software. Tambo isn't just a chatbot—it's a deeply integrated system that understands your workspace context and can perform actions on your behalf.

### How We Use Tambo

Orbit leverages Tambo's React SDK (`@tambo-ai/react`) to create a seamless AI-native experience:

**1. Context-Aware Components**  
We've registered custom UI components as Tambo components, allowing the AI to generate and control workspace elements dynamically. When you ask to "create a sprint" or "show my tasks," Tambo renders the appropriate interface component with pre-filled data.

**2. Action-Oriented Tools**  
Tambo tools enable the AI to read and modify workspace data programmatically. The AI can query tasks, create workspaces, update team members, and navigate your application—all through natural language commands.

**3. Intelligent Document Generation**  
Our Markdown editor integrates Tambo's generation capabilities, enabling the AI to draft meeting notes, sprint retrospectives, and technical documentation based on your workspace data and simple prompts.

### Implementation Highlights

- **26+ Custom Components**: From `TaskCreator` to `SprintCard`, each component is registered with Tambo and can be invoked by the AI
- **10+ Action Tools**: Functions like `get_tasks()`, `create_workspace()`, and `delete_workspace()` provide the AI with workspace manipulation capabilities
- **Unified Provider**: `TamboProviderWrapper` wraps the entire application, maintaining conversation context across all interactions
- **Type-Safe Schemas**: Zod validation ensures that AI-generated component props and tool inputs are always valid

## Why Orbit Stands Out

### Traditional Tools vs. Orbit

**Traditional Project Management:**
- Navigate through menus to create tasks
- Fill out lengthy forms manually
- Switch between multiple views to find information
- Repeat the same actions across projects

**Orbit with Tambo:**
- Type: *"Create a high-priority task for fixing the login bug, assign to Sarah"*
- Ask: *"What tasks are due this week?"*
- Request: *"Draft a sprint retrospective for Sprint 5"*
- Navigate: *"Show me the backlog"*

### Key Advantages

**Natural Language Interface**  
Perform complex workflows in seconds through conversation. No need to remember where features are located or click through multiple screens.

**Contextual Intelligence**  
Tambo understands your workspace structure, current sprint, team members, and project state. It provides relevant suggestions and automates repetitive tasks.

**Flexible Interaction Model**  
Use the AI when it's faster, use the UI when you prefer visual control. Both approaches work seamlessly together—changes made through AI appear instantly in the interface.

**Extensible Architecture**  
Adding new capabilities is as simple as registering a new component or tool. The AI automatically learns to use them without requiring interface redesigns.

**Developer-Friendly**  
Built with Next.js 14, TypeScript, Material-UI, and modern React patterns. The codebase is clean, type-safe, and follows best practices.

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **UI Framework**: Material-UI (MUI), Radix UI primitives
- **AI Integration**: Tambo AI React SDK
- **Rich Text Editing**: Tiptap with AI-powered generation
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Validation**: Zod schemas
- **Animations**: Framer Motion

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd orbit

# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start creating your first workspace—try asking the AI assistant for help!

## Documentation

- **[User Guide](./docs/user-guide.md)** - Complete guide for using Orbit effectively
- **[Tambo Documentation](https://docs.tambo.co)** - Learn more about Tambo AI capabilities

## Project Structure

```
orbit/
├── web/                      # Next.js application
│   ├── app/                  # App router pages
│   ├── components/
│   │   ├── tambo/           # AI-integrated components (26+ files)
│   │   └── ui/              # Base UI components
│   ├── lib/
│   │   ├── tambo.ts         # Central Tambo configuration
│   │   └── store.ts         # Zustand state management
│   └── ...
└── docs/                     # Documentation
```

## License

This project is built with Tambo AI. Visit [docs.tambo.co](https://docs.tambo.co) to learn more about building AI-native applications.
