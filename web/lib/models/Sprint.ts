import mongoose, { Schema, Model } from 'mongoose';
import { SprintItem } from '../types';

const SprintSchema = new Schema<SprintItem>({
  sprint: { type: String, required: true },
  sprintGoals: { type: String, default: '' },
  activeSprintStatus: {
    type: String,
    enum: ['Active', 'Planned', 'Completed'],
    default: 'Planned'
  },
  sprintTimeline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  connectedTasks: [{ type: String }], // Array of task IDs
  completed: { type: Boolean, default: false },
  sprintStartDate: { type: Date, required: true },
  sprintEndDate: { type: Date, required: true },
  workspaceId: { type: String, required: true },
  teamId: { type: String, required: true },
  pageId: { type: String, required: true },
  owner: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  }
}, {
  timestamps: true
});

// Indexes
SprintSchema.index({ activeSprintStatus: 1 });
SprintSchema.index({ sprintStartDate: 1, sprintEndDate: 1 });
SprintSchema.index({ workspaceId: 1, teamId: 1 });
SprintSchema.index({ teamId: 1 });
SprintSchema.index({ pageId: 1 });

let Sprint: Model<SprintItem>;

if (mongoose.models.Sprint) {
  if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Sprint;
    Sprint = mongoose.model<SprintItem>('Sprint', SprintSchema);
  } else {
    Sprint = mongoose.models.Sprint;
  }
} else {
  Sprint = mongoose.model<SprintItem>('Sprint', SprintSchema);
}

export default Sprint;
