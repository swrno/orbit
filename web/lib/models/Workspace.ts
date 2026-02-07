import mongoose, { Schema, Model } from 'mongoose';
import { Workspace, Team, Page, TeamMember, WorkspaceMember, ColumnDefinition } from '../types';

// Column Schema
const ColumnSchema = new Schema({
    id: String,
    title: String,
    type: String,
    field: String,
    width: Number,
    options: [String],
    connectTo: String,
    editable: Boolean
});

// Page Schema
const PageSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    icon: String,
    columns: [ColumnSchema],
    content: String,
    views: [String],
    activeViewIndex: Number,
    pageType: String
});

// Team Member Schema
const TeamMemberSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: String,
    avatar: String,
    role: String,
    teamRole: { type: String, enum: ['LEADER', 'MEMBER', 'VIEWER'] }
});

// Workspace Member Schema (with access control)
const WorkspaceMemberSchema = new Schema({
    id: { type: String, required: true }, // Firebase UID
    name: { type: String, required: true },
    email: String,
    avatar: String,
    role: { type: String, required: true, enum: ['OWNER', 'EDITOR', 'VIEWER'], default: 'VIEWER' },
    addedAt: { type: Date, default: Date.now }
});

// Team Schema
const TeamSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: String,
    pages: [PageSchema],
    members: [TeamMemberSchema], // Members specific to this team
    leaderId: String, // User ID of team leader

    // Embedded Data Arrays (using loose schema for flexibility during refactor)
    bugs: [new Schema({}, { strict: false })],
    tasks: [new Schema({}, { strict: false })],
    epics: [new Schema({}, { strict: false })],
    sprints: [new Schema({}, { strict: false })],
    retrospectives: [new Schema({}, { strict: false })]
});

// Add nested teams support (recursive)
TeamSchema.add({ teams: [TeamSchema] });

// Workspace Schema
const WorkspaceSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    color: String,
    key: { type: String, required: true },
    plan: { type: String, default: 'Free' },
    teams: [TeamSchema],
    ownerId: { type: String, required: true }, // Firebase UID of owner
    members: [WorkspaceMemberSchema], // Workspace members with roles
    teamMembers: [TeamMemberSchema], // Keeping for backward compatibility
    taskCounter: { type: Number, default: 0 },
    epicCounter: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes
WorkspaceSchema.index({ id: 1 });
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ "members.id": 1 }); // To find workspaces by user
WorkspaceSchema.index({ "teamMembers.id": 1 }); // Backward compatibility

let WorkspaceModel: Model<Workspace>;

if (mongoose.models.Workspace) {
    WorkspaceModel = mongoose.models.Workspace as Model<Workspace>;
} else {
    WorkspaceModel = mongoose.model<Workspace>('Workspace', WorkspaceSchema);
}

export default WorkspaceModel;
