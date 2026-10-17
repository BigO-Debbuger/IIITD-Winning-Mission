import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js"; 
import projectRoutes from "./routes/projectRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mentorshipRoutes from "./routes/mentorshipRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import collabRoutes from './routes/collabRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import ventureRoutes from './routes/ventureRoutes.js';
import credentialRoutes from './routes/credentialRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

// Startup Configuration Validation
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ [SECURITY WARNING] JWT_SECRET is not set. Authentication will fail or be insecure.");
}

const isTest =
  process.env.NODE_ENV === "test" ||
  Boolean(process.env.NODE_TEST_CONTEXT) ||
  process.argv.some((arg) => arg.includes("test"));

// Connect to PostgreSQL via Prisma if not in test environment
if (!isTest) {
  connectDB().catch((err) => {
    console.error("⚠️ [DATABASE NOTICE] Database connection could not be established at startup:", err.message);
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Prevent unbounded JSON payload sizes

// Static folder for file uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/collab', collabRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/venture', ventureRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/network', networkRoutes);

app.get("/", (req, res) => {
  res.send("WaveSync API is running...");
});

// Mount centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001; 
if (!isTest) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;