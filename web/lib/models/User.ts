import mongoose, { Schema, Model } from 'mongoose';

export type User = {
  id: string; // Firebase UID
  email: string;
  name: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String
}, {
  timestamps: true
});

let UserModel: Model<User>;

if (mongoose.models.User) {
  UserModel = mongoose.models.User as Model<User>;
} else {
  UserModel = mongoose.model<User>('User', UserSchema);
}

export default UserModel;
