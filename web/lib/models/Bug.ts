import mongoose, { Schema, Model } from 'mongoose';
import { BugItem } from '../types';

const BugSchema = new Schema<BugItem>({
  bug: { type: String, required: true },
  reporter: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  },
  timeUntilResolution: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Awaiting Review', 'Pending Review', 'Ready for Dev', 'Done', 'Fixed'],
    default: 'Awaiting Review'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  connectedTasks: [{ type: String }], // Array of task IDs
  bugId: { type: String, required: true, unique: true },
  group: {
    type: String,
    enum: ['Incoming Bugs', 'Development Work', 'Resolved'],
    default: 'Incoming Bugs'
  },
  workspaceId: { type: String, required: true },
  teamId: { type: String, required: true },
  pageId: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
BugSchema.index({ bugId: 1 });
BugSchema.index({ group: 1 });
BugSchema.index({ priority: 1 });
BugSchema.index({ status: 1 });
BugSchema.index({ workspaceId: 1, teamId: 1 }); // Composite index for filtering
BugSchema.index({ teamId: 1 });
BugSchema.index({ pageId: 1 });

let Bug: Model<BugItem>;

if (mongoose.models.Bug) {
  if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Bug;
    Bug = mongoose.model<BugItem>('Bug', BugSchema);
  } else {
    Bug = mongoose.models.Bug;
  }
} else {
  Bug = mongoose.model<BugItem>('Bug', BugSchema);
}

export default Bug;
