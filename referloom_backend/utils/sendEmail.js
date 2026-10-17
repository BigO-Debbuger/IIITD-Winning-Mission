// referloom_backend/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  try {
    // 1. Create a transporter (The Mailman)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `"Referloom Team" <${process.env.EMAIL_USER}>`, // Sender address
      to: options.email, // Receiver address (from otpController)
      subject: options.subject, // Subject line
      text: options.message, // Plain text body
      // You can even add HTML to make it look pretty!
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
          <h2 style="color: #221244;">Welcome to Referloom!</h2>
          <p style="font-size: 16px; color: #333;">Your verification code is:</p>
          <div style="margin: 20px auto; padding: 15px; max-width: 200px; background-color: #3EB489; border-radius: 8px;">
            <h1 style="color: #fff; margin: 0; letter-spacing: 5px;">${options.message.match(/\d{6}/)[0]}</h1>
          </div>
          <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
        </div>
      `
    };

    // 3. Actually send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: %s", info.messageId);

  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};