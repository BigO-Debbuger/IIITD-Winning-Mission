// referloom_backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "alumni", "company", "admin"], required: true },
  fullName: { type: String, required: true },
  profileImage: { type: String, default: null }, // Added for Edit Profile
  
  // 🔐 PRIVACY & VISIBILITY ENGINE
  visibilityMode: { type: String, enum: ["public", "private"], default: "private" },
  grantedAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 

  // 🎓 UNIVERSAL PROFILE FIELDS
  isVerified: { type: Boolean, default: false }, 
  isProfileComplete: { type: Boolean, default: false },
  headline: { type: String, default: "" },
  bio: { type: String, default: "" },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

  // --- ROLE SPECIFIC DATA ---
  studentDetails: {
    course: String,
    semester: String,
    university: { type: String, default: 'Navrachana University' },
    skills: [String],
    experience: [{
      company: String,
      role: String,
      startDate: String, // ✅ NEW: e.g. "Jan 2023"
      endDate: String,   // ✅ NEW: e.g. "Dec 2023" or "Present"
      isCurrent: { type: Boolean, default: false },
      
      description: String
    }],
    careerPreferences: {
      fields: [{ type: String }],
      companies: [{ type: String }],
      locations: [{ type: String }],
      jobTypes: [{ type: String }],     // ✅ NEW: e.g., 'Internship', 'Full-Time'
      timeline: [{ type: String }]
    },
    aiCareerRoadmap: [{ type: String }]
    
  },

  alumniDetails: {
    graduationYear: String,
    company: String,
    role: String,
    degreeProof: String,
  },

  companyDetails: {
    companyName: String,
    hrContact: String,
    industryType: String,
    website: String,
    description: String,
    idProof: String,
  },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);