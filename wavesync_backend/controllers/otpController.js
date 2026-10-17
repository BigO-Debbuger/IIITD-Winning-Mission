// wavesync_backend/controllers/otpController.js
import { prisma } from "../config/prisma.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if user already exists AND is already verified
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "An account with this email is already verified. Please log in." });
    }

    // 1. Generate 6-digit OTP
    const otpCode = generateOTP();

    // 2. Clear any prior OTPs for this email and save new record with 10-minute expiration
    await prisma.otp.deleteMany({ where: { email: cleanEmail } });

    await prisma.otp.create({
      data: {
        email: cleanEmail,
        otp: otpCode,
        attempts: 0,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // 3. Dispatch verification email via Nodemailer
    const message = `Welcome to WaveSync! Your verification code is: ${otpCode}. It will expire in 10 minutes.`;
    try {
      await sendEmail({
        email: cleanEmail,
        subject: "Your WaveSync Verification Code",
        message: message,
      });
    } catch (mailError) {
      console.warn("⚠️ [EMAIL SERVICE NOTICE]:", mailError.message);
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ message: "Failed to send verification email. Please check server email configuration." });
      }
    }

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.log(`[DEV ONLY] OTP generated for ${cleanEmail}: ${otpCode}`);
    }

    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    res.status(200).json({
      message: "OTP sent successfully",
      ...(isDev ? { devOtp: otpCode } : {}),
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await prisma.otp.findFirst({
      where: { email: cleanEmail, isVerified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "No active verification code found for this email. Please request a new one." });
    }

    // Check expiration
    if (new Date(otpRecord.expiresAt) < new Date()) {
      await prisma.otp.deleteMany({ where: { email: cleanEmail } });
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // Check brute-force attempts limit
    if (otpRecord.attempts >= 5) {
      await prisma.otp.deleteMany({ where: { email: cleanEmail } });
      return res.status(429).json({ message: "Too many failed attempts. Please request a new verification code." });
    }

    // Validate OTP match
    if (otpRecord.otp !== cleanOtp) {
      const updatedAttempts = otpRecord.attempts + 1;
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: updatedAttempts },
      });
      const remaining = 5 - updatedAttempts;
      return res.status(400).json({
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }

    // Mark OTP as successfully verified and update existing user if present
    await prisma.$transaction(async (tx) => {
      await tx.otp.update({
        where: { id: otpRecord.id },
        data: { isVerified: true },
      });

      const existingUser = await tx.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        await tx.user.update({
          where: { email: cleanEmail },
          data: { isVerified: true },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};