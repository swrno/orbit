# User Guide

Learn how to use Orbit AI Workspace effectively with Tambo AI assistance.

---

## Getting Started

### Your First Workspace

1. **Open Orbit** at [http://localhost:3000](http://localhost:3000)
2. Click **"Get Started"** or navigate to `/dashboard`
3. The AI assistant will greet you in the bottom-right corner

**Create a Workspace:**
- Click **"Create Workspace"** button, OR
- Ask the AI: `"Create a new workspace called My Project"`

The AI (powered by Tambo) will handle the creation for you!

---

## Using Tambo AI Assistant

### Opening the Chat

Press **⌘K** (Mac) or **Ctrl+K** (Windows) anytime to open the AI assistant.

Alternatively, click the **chat icon** in the bottom-right corner.

### What Can Tambo Do?

Tambo understands your workspace and can:

#### 1. Create & Manage Tasks
```
"Create a task for implementing user authentication"
"Show me all tasks assigned to Sarah"
"Update task WS1-42 to In Progress"
```

#### 2. Sprint Planning
```
"Create a new sprint called Sprint 5"
"What tasks are in the current sprint?"
"Show me the sprint burndown chart"
```

#### 3. Epic Management
```
"Create an epic for the payment system"
"List all epics in progress"
```

#### 4. Navigation
```
"Go to the backlog"
"Navigate to reports"
"Open the team page"
```

#### 5. Document Creation
```
"Draft a sprint retrospective document"
"Write a project status update"
"Create meeting notes"
```

#### 6. Workspace Management
```
"List all my workspaces"
"Switch to the Mobile App workspace"
"Show team members"
```

### Tips for Better AI Interactions

✅ **Be specific**: "Create a high-priority bug for login button not working"  
✅ **Use natural language**: Talk to Tambo like a teammate  
✅ **Ask for help**: "What can you help me with?"  
❌ **Avoid vague requests**: "Fix everything" (too broad)

---

## Managing Your Backlog

### What is a Backlog?

The backlog is your **single source of truth** for all work items - user stories, tasks, bugs, and features.

### Creating Tasks

**Via UI:**
1. Navigate to **Backlog** (sidebar)
2. Click **"Create Task"**
3. Fill in:
   - Title (required)
   - Description
   - Story Points
   - Priority (Low/Medium/High/Critical)
   - Epic (optional)

**Via AI:**
```
"Create a task: User can reset password via email, 5 story points, high priority"
```

### Organizing Tasks

**Prioritize**: Drag tasks up/down to reorder by importance  
**Filter**: Use search or status filters  
**Estimate**: Add story points (1, 2, 3, 5, 8, 13...)  
**Link to Epics**: Group related tasks under strategic initiatives

---

## Sprint Planning

### What is a Sprint?

A **sprint** is a time-boxed period (usually 2 weeks) where your team commits to delivering specific work.

### Creating a Sprint

**Via UI:**
1. Go to **Sprints** page
2. Click **"Create Sprint"**
3. Set:
   - Name (e.g., "Sprint 5")
   - Goal (what you'll achieve)
   - Start date
   - End date

**Via AI:**
```
"Create a sprint called Sprint 5 with goal 'Complete user authentication' starting today for 2 weeks"
```

### Adding Tasks to Sprint

**Method 1 - Drag & Drop:**
1. Open sprint details
2. Drag tasks from backlog into sprint

**Method 2 - AI:**
```
"Add task WS1-42 to Sprint 5"
"Move all high-priority authentication tasks to the current sprint"
```

### Starting a Sprint

Click **"Start Sprint"** to activate it. Tasks will appear on your Scrum board.

---

## Using the Scrum Board

### What is a Scrum Board?

A visual board showing your sprint tasks across workflow stages:
- **To Do** → **In Progress** → **In Review** → **Done**

### Moving Tasks

**Drag & Drop**: Simply drag cards between columns  

**Quick Update**: Click task → Change status dropdown  

**Via AI:**
```
"Move task WS1-42 to In Progress"
"Mark WS1-50 as Done"
```

### Task Details

Click any task card to view:
- Full description
- Assignee
- Story points
- Comments
- Subtasks
- Time logs

---

## Epic Management

### What is an Epic?

An **epic** is a large initiative broken down into smaller tasks. Epics typically span multiple sprints.

**Example:**
```
Epic: "User Authentication System"
├── Task: Login with email/password
├── Task: Social login (Google)
├── Task: Password reset flow
└── Task: Two-factor authentication
```

### Creating Epics

**Via UI:**
1. Navigate to **Epics**
2. Click **"Create Epic"**
3. Fill in:
   - Name
   - Description
   - Color (for visual identification)
   - Target date (optional)

**Via AI:**
```
"Create an epic called Payment Integration with target date next month"
```

### Linking Tasks to Epics

When creating a task, select the epic from the dropdown, or ask AI:
```
"Link task WS1-42 to the Authentication epic"
```

---

## Bug Tracking

### Reporting Bugs

**Via UI:**
1. Go to **Bugs** page
2. Click **"Report Bug"**
3. Include:
   - Title (what's broken)
   - Steps to reproduce
   - Expected vs actual behavior
   - Severity (Low/Medium/High/Critical)
   - Environment (browser, OS)

**Via AI:**
```
"Report a bug: Login button doesn't work on Safari, high severity"
```

### Bug Lifecycle

```
Open → Triage → Assigned → In Progress → Fixed → Verified → Closed
```

**Triage**: Assess severity and priority  
**Assign**: Give to team member  
**Fix**: Developer resolves issue  
**Verify**: QA tests the fix  
**Close**: Mark as resolved

---

## Reports & Analytics

Navigate to **Reports** to view:

### 1. Velocity Chart
Shows story points completed per sprint. Use this to:
- Predict future capacity
- Track team performance trends

**Reading it:**
If your average velocity is 30 points/sprint, plan ~30 points for next sprint.

### 2. Burndown Chart
Daily remaining work in current sprint.

**Reading it:**
- Line above ideal = behind pace
- Line below ideal = ahead of pace

### 3. Cumulative Flow Diagram (CFD)
Work distribution across statuses over time.

**Reading it:**
Growing horizontal bands indicate bottlenecks.

### 4. Sprint Report
Completed vs planned work for each sprint.

### 5. Bug Report
Bugs opened vs resolved over time.

---

## Team Management

### Adding Team Members

**Via UI:**
1. Go to **Team** page
2. Click **"Add Member"**
3. Enter name, email, role

**Via AI:**
```
"Add team member Sarah Johnson, sarah@email.com, Senior Developer"
```

### Assigning Tasks

When creating or editing a task:
- Select assignee from dropdown
- Or say: `"Assign task WS1-42 to Sarah"`

---

## AI-Powered Document Editing

### Creating Documents

Ask Tambo to draft content:
```
"Draft a sprint retrospective for Sprint 4"
"Write a technical design doc for the API integration"
"Create meeting notes for today's standup"
```

Tambo will open the **MarkdownEditor** with AI-generated content that you can edit and save.

### Editing Documents

For existing pages:
```
"Edit the Design Docs page"
"Update the API documentation"
```

---

## Search & Navigation

### Global Search

Press **⌘K** / **Ctrl+K** and type to search across:
- Tasks
- Epics
- Sprints
- Pages
- Team members

### AI Navigation

Just ask Tambo:
```
"Go to backlog"
"Navigate to Sprint 5"
"Open reports"
"Show me the roadmap"
```

---

## Best Practices

### Backlog Management
✅ Keep stories small (1-3 days of work)  
✅ Write clear acceptance criteria  
✅ Prioritize by business value  
✅ Groom backlog weekly  

### Sprint Planning
✅ Set realistic sprint goals  
✅ Base commitments on historical velocity  
✅ Include buffer for bugs/unexpected work  
❌ Don't add work mid-sprint without removing something  

### Bug Tracking
✅ Include reproduction steps  
✅ Set appropriate severity  
✅ Fix critical bugs immediately  
✅ Review bug trends in retrospectives  

### Working with Tambo AI
✅ Be specific in your requests  
✅ Use natural language  
✅ Ask for clarifications if needed  
✅ Leverage AI for repetitive tasks  

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open AI assistant |
| `⌘/` / `Ctrl+/` | Global search |
| `Esc` | Close modals |

---

## Common Workflows

### Starting Your Day
1. Press `⌘K` and ask: "What tasks are assigned to me?"
2. Check burndown chart for sprint progress
3. Update task statuses on scrum board

### Planning a Sprint
1. Review backlog and prioritize
2. Create new sprint with clear goal
3. Drag high-priority items into sprint
4. Check team capacity vs story points
5. Start sprint and communicate with team

### End of Sprint
1. Complete sprint
2. Ask AI: "Draft a sprint retrospective"
3. Review velocity chart
4. Move incomplete items back to backlog
5. Plan next sprint

---

## Advanced Features

### Custom Columns (Table View)
1. Navigate to a table view page
2. Click **"Add Column"**
3. Choose type: text, number, status, date, labels

### Subtasks
Click a task → **"Add Subtask"** to break work into smaller pieces

### Time Logging
Track hours spent on tasks for better estimation

### Dependencies
Mark tasks that block or are blocked by other tasks

---

## Getting Help

### Ask Tambo
The AI assistant can explain features:
```
"How do I create a sprint?"
"What's a burndown chart?"
"Explain epics to me"
```

### Documentation
- **Installation**: `docs/installation.md`
- **Tambo Docs**: [docs.tambo.co](https://docs.tambo.co)

---

## Tips for Success

🎯 **Start Small**: Create one workspace, one sprint  
🤖 **Use AI Often**: Let Tambo handle repetitive tasks  
📊 **Review Metrics**: Check velocity after every sprint  
🗣️ **Communicate**: Use the tool to facilitate, not replace, team discussion  
🔄 **Iterate**: Adjust your process based on what works  

---

**You're ready to ship better software, faster!** 🚀

Have questions? Just ask Tambo - your AI workspace assistant is always ready to help.
