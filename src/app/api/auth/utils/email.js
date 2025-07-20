import nodemailer from "nodemailer";

export async function sendVerificationEmail(userEmail, verificationToken) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // You can use another service like SendGrid or Mailgun
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email username
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userEmail,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
