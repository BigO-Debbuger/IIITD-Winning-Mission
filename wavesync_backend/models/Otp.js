import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: { 
    type: String, 
    required: true 
  },
  attempts: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 900 // 15 minutes TTL to allow registration after verification
  }
});

export default mongoose.model("Otp", otpSchema);