import mongoose, { Schema, Model } from 'mongoose';
import { EpicItem } from '../types';

const EpicSchema = new Schema<EpicItem>({
  epic: { type: String, required: true },
  owner: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  },
  phase: {
    type: String,
    enum: ['Dev WIP', 'Product discovery', 'Backlog', 'Nice to Have', 'Best Effort'],
    default: 'Backlog'
  },
  priority: {
    type: String,
    enum: ['Must Have', 'Critical', 'Nice to Have'],
    default: 'Nice to Have'
  },
  hierarchy: { type: Number, default: 0 },
  children: [{ type: Schema.Types.Mixed }], // Array of nested EpicItem objects
  workspaceId: { type: String, required: true },
  teamId: { type: String, required: true },
  pageId: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
EpicSchema.index({ phase: 1 });
EpicSchema.index({ priority: 1 });
EpicSchema.index({ hierarchy: 1 });
EpicSchema.index({ workspaceId: 1, teamId: 1 });
EpicSchema.index({ teamId: 1 });
EpicSchema.index({ pageId: 1 });

let Epic: Model<EpicItem>;

if (mongoose.models.Epic) {
  if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Epic;
    Epic = mongoose.model<EpicItem>('Epic', EpicSchema);
  } else {
    Epic = mongoose.models.Epic;
  }
} else {
  Epic = mongoose.model<EpicItem>('Epic', EpicSchema);
}

export default Epic;
