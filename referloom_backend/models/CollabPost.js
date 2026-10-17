// referloom_backend/models/CollabPost.js
import mongoose from "mongoose";

const collabPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // e.g., 'Hackathon', 'Project'
  title: { type: String, required: true },
  description: { type: String, required: true },
  roles: [{ type: String }], // e.g., ['Frontend Dev', 'UI/UX']
  isActive: { type: Boolean, default: true },
  
  // Embedded array to store who applied to this specific post
  applicants: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String }, // Which role they are applying for
    message: { type: String },
    appliedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CollabPost", collabPostSchema);