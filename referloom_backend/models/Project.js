// referloom_backend/models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  technologies: [{ 
    type: String // Frontend sends this as 'tags'
  }],
  github: { 
    type: String, 
    default: null 
  },
  live: { 
    type: String, 
    default: null 
  },
  image: { 
    type: String, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Project", projectSchema);