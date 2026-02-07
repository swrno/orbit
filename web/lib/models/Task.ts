import mongoose, { Schema, Model } from 'mongoose';
import { TaskItem } from '../types';

const TaskSchema = new Schema<TaskItem>({
  task: { type: String, required: true },
  owner: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  },
  status: {
    type: String,
    enum: ['Ready to start', 'In Progress', 'Done'],
    default: 'Ready to start'
  },
  type: {
    type: String,
    enum: ['Bug', 'Feature', 'Other'],
    default: 'Other'
  },
  taskId: { type: String, required: true, unique: true },
  estimatedSP: { type: Number, default: 0 },
  epic: { type: String }, // Epic ID reference
  githubLink: String,
  sprint: { type: String, default: 'Backlog' }, // Sprint ID reference  
  group: { type: String, default: 'Backlog' }, // Sprint-based group name
  workspaceId: { type: String, required: true },
  teamId: { type: String, required: true },
  pageId: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes for faster queries
TaskSchema.index({ taskId: 1 });
TaskSchema.index({ sprint: 1 });
TaskSchema.index({ epic: 1 });
TaskSchema.index({ group: 1 });
TaskSchema.index({ workspaceId: 1, teamId: 1 });
TaskSchema.index({ teamId: 1 });
TaskSchema.index({ pageId: 1 });

let Task: Model<TaskItem>;

if (mongoose.models.Task) {
  if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Task;
    Task = mongoose.model<TaskItem>('Task', TaskSchema);
  } else {
    Task = mongoose.models.Task;
  }
} else {
  Task = mongoose.model<TaskItem>('Task', TaskSchema);
}

export default Task;
