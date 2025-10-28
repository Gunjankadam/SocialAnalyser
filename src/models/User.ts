import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password?: string;
  createdAt: Date;
  resetOtp?: string;
  resetOtpExpires?: Date;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
});

export default mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
