import mongoose, { Schema, Model } from 'mongoose';
import { RetrospectiveItem } from '../types';

const RetrospectiveSchema = new Schema<RetrospectiveItem>({
  feedback: { type: String, required: true },
  submitter: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  },
  type: {
    type: String,
    enum: ['Discussion', 'Improve', 'Keep'],
    default: 'Discussion'
  },
  repeating: { type: Boolean, default: false },
  vote: { type: Number, default: 0 },
  owner: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    email: String,
    role: String
  },
  sprint: { type: String, required: true }, // Sprint name/ID for grouping
  workspaceId: { type: String, required: true },
  teamId: { type: String, required: true },
  pageId: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
RetrospectiveSchema.index({ sprint: 1 });
RetrospectiveSchema.index({ type: 1 });
RetrospectiveSchema.index({ vote: -1 }); // Descending for sorting by most votes
RetrospectiveSchema.index({ workspaceId: 1, teamId: 1 });
RetrospectiveSchema.index({ teamId: 1 });
RetrospectiveSchema.index({ pageId: 1 });

let Retrospective: Model<RetrospectiveItem>;

if (mongoose.models.Retrospective) {
  if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Retrospective;
    Retrospective = mongoose.model<RetrospectiveItem>('Retrospective', RetrospectiveSchema);
  } else {
    Retrospective = mongoose.models.Retrospective;
  }
} else {
  Retrospective = mongoose.model<RetrospectiveItem>('Retrospective', RetrospectiveSchema);
}

export default Retrospective;
