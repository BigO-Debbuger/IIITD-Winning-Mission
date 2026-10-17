// wavesync_backend/middlewares/authMiddleware.js
// Note: prisma is imported lazily in protect() so that authorizeRoles() can be
// imported and unit-tested without a live database connection.

let jwt = null;
try {
  const jwtModule = await import("jsonwebtoken");
  jwt = jwtModule.default || jwtModule;
} catch (e) {
  // jsonwebtoken not installed in current environment
}

const getJwtSecret = () => {
  if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "wavesync_dev_fallback_secret_key_32chars")) {
    throw new Error("JWT_SECRET must be securely set in production environment.");
  }
  return process.env.JWT_SECRET || "wavesync_dev_fallback_secret_key_32chars";
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!jwt) {
        return res.status(500).json({ message: "JWT service unavailable" });
      }
      const decoded = jwt.verify(token, getJwtSecret());

      // Lazy import Prisma so this file is safe to import in unit tests without DB
      const { prisma } = await import("../config/prisma.js");

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          profileImage: true,
          visibilityMode: true,
          isVerified: true,
          isProfileComplete: true,
          headline: true,
          bio: true,
          studentDetails: true,
          alumniDetails: true,
          companyDetails: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user no longer exists" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Role-based authorization middleware — pure function, no DB calls, safe for unit tests
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user?.role || "unknown"}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Optional authentication middleware: populates req.user if valid token provided, but doesn't block guests
export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (jwt && token) {
        const decoded = jwt.verify(token, getJwtSecret());
        const { prisma } = await import("../config/prisma.js");
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            fullName: true,
            profileImage: true,
            visibilityMode: true,
            isVerified: true,
            isProfileComplete: true,
            headline: true,
            bio: true,
            studentDetails: true,
            alumniDetails: true,
            companyDetails: true,
            createdAt: true,
          },
        });
        if (user) {
          req.user = user;
        }
      }
    } catch {
      // Invalid/expired token — proceed as guest
    }
  }
  next();
};