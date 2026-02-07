# MongoDB Reference Architecture

## Overview

The application uses a **reference-based architecture** where data is stored in separate MongoDB collections and fetched via references (workspaceId, teamId, pageId) instead of being embedded in workspace or team documents.

## Collections Structure

### Primary Collections

1. **Workspaces** - Stores workspace metadata and structure
2. **Users** - Stores user profiles (linked to Firebase UID)
3. **Tasks** - Separate collection for all tasks
4. **Bugs** - Separate collection for all bugs
5. **Epics** - Separate collection for all epics
6. **Sprints** - Separate collection for all sprints
7. **Retrospectives** - Separate collection for all retrospectives

## Reference Fields

Each data item (Task, Bug, Epic, Sprint, Retrospective) contains the following reference fields:

- **`workspaceId`**: Links to parent workspace
- **`teamId`**: Links to parent team
- **`pageId`**: Links to parent page

### Example Task Document

```json
{
  "_id": "ObjectId(...)",
  "taskId": "PROJ-123",
  "task": "Implement authentication",
  "workspaceId": "ws-1234567890",
  "teamId": "team-1234567890",
  "pageId": "p-1234567890-3",
  "owner": { "id": "user-123", "name": "John Doe" },
  "status": "In Progress",
  "createdAt": "2026-02-07T12:00:00Z"
}
```

## Fetching Data

### By Workspace
```typescript
// Get all tasks in a workspace
GET /api/tasks?workspaceId=ws-123

// MongoDB query
Task.find({ workspaceId: 'ws-123' })
```

### By Team
```typescript
// Get all tasks in a team
GET /api/tasks?teamId=team-456

// MongoDB query
Task.find({ teamId: 'team-456' })
```

### By Page
```typescript
// Get all tasks on a specific page
GET /api/tasks?pageId=p-789

// MongoDB query
Task.find({ pageId: 'p-789' })
```

### Combined Filters
```typescript
// Get all tasks in a workspace's team
GET /api/tasks?workspaceId=ws-123&teamId=team-456

// MongoDB query
Task.find({ workspaceId: 'ws-123', teamId: 'team-456' })
```

## Benefits of Reference Architecture

### 1. **Scalability**
- No document size limits (MongoDB has 16MB document limit)
- Can have unlimited tasks, bugs, epics per workspace
- Better performance for large datasets

### 2. **Query Flexibility**
- Filter by any combination of workspace/team/page
- Easier to implement pagination
- More efficient indexing

### 3. **Data Consistency**
- Single source of truth for each item
- Easier to update items across multiple views
- No data duplication

### 4. **Better Performance**
- Fetch only what you need
- Reduced network payload
- Faster workspace queries (no embedded arrays)

## API Endpoints

All data endpoints support filtering by references:

| Endpoint | Supported Filters |
|----------|------------------|
| `/api/tasks` | workspaceId, teamId, pageId |
| `/api/bugs` | workspaceId, teamId, pageId |
| `/api/epics` | workspaceId, teamId, pageId |
| `/api/sprints` | workspaceId, teamId, pageId |
| `/api/retrospectives` | workspaceId, teamId, pageId |

## Client-Side Caching

The client-side Zustand store maintains a cache of fetched data for performance:

```typescript
interface Workspace {
  id: string;
  // ... metadata
  
  // Cached data (fetched separately)
  tasks: Task[];
  sprints: Sprint[];
  epics: Epic[];
  // ...
}
```

### Fetching Pattern

```typescript
// 1. Fetch workspace structure
const workspace = await fetch(`/api/workspaces?userId=${userId}`);

// 2. Fetch related data via references
const tasks = await fetch(`/api/tasks?workspaceId=${workspace.id}`);
const sprints = await fetch(`/api/sprints?workspaceId=${workspace.id}`);

// 3. Update local store cache
updateWorkspace(workspace.id, { tasks, sprints });
```

## Indexes

Each collection has indexes on reference fields for optimal query performance:

```javascript
// Task collection indexes
TaskSchema.index({ workspaceId: 1, teamId: 1 });
TaskSchema.index({ teamId: 1 });
TaskSchema.index({ pageId: 1 });

// Similar indexes for Bug, Epic, Sprint, Retrospective collections
```

## Migration Notes

The workspace schema no longer contains embedded arrays:

**Before:**
```javascript
const TeamSchema = new Schema({
  // ...
  bugs: [BugSchema],
  tasks: [TaskSchema],
  // ...
});
```

**After:**
```javascript
const TeamSchema = new Schema({
  // ...
  // Data is fetched via references, not embedded
});
```

## Best Practices

1. **Always include reference fields** when creating new items
2. **Use API endpoints** to fetch data, don't embed in workspace
3. **Cache wisely** - only cache what you need in the client store
4. **Clean up references** when deleting workspaces/teams
5. **Use indexes** for all reference field combinations you query

## Example: Creating a Task

```typescript
// POST /api/tasks
const newTask = {
  task: "Implement feature",
  workspaceId: "ws-123",
  teamId: "team-456",
  pageId: "p-789",
  owner: { id: "user-1", name: "John" },
  status: "Ready to start"
};

// MongoDB automatically assigns _id
// Task is stored in separate Tasks collection
// Can be queried by workspace/team/page references
```

## Example: Fetching Team Data

```typescript
// 1. Get workspace
const workspace = await Workspace.findOne({ id: 'ws-123' });

// 2. Get team from workspace
const team = workspace.teams.find(t => t.id === 'team-456');

// 3. Fetch team's data via references
const tasks = await Task.find({ teamId: 'team-456' });
const bugs = await Bug.find({ teamId: 'team-456' });
const sprints = await Sprint.find({ teamId: 'team-456' });

// 4. Return combined data
return { ...team, tasks, bugs, sprints };
```

## Summary

The reference-based architecture provides:
- ✅ Better scalability (no document size limits)
- ✅ Improved query performance (indexed references)
- ✅ Flexible data fetching (filter by any reference)
- ✅ Single source of truth (no data duplication)
- ✅ Easier maintenance (separate collections)
