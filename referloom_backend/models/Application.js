// referloom_backend/models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fitScore: { type: Number, required: true },
  // ✅ FIXED: Added 'shortlisted' to the enum array
  status: { 
    type: String, 
    enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'accepted', 'rejected'], 
    default: 'applied' 
  },
  isReferral: { type: Boolean, default: false },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Application", applicationSchema);