import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: String,
    role: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// This minimal schema is for reference/population in the Community DB. This schema is used solely for population purposes
export default mongoose.model("User", userSchema);
