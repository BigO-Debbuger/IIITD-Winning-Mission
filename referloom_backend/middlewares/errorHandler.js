// middlewares/errorHandler.js
export default function errorHandler(err, req, res, next) {
  // Log server errors for debugging (without leaking credentials)
  if (process.env.NODE_ENV !== "test") {
    console.error("🚨 [ERROR]:", err.message);
  }

  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size allowed is 5MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation error", errors: messages });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid authentication token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Authentication token expired" });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
}
