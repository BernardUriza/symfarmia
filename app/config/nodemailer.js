import nodemailer from "nodemailer";

// Replace these with your actual email and password
const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;


export const transporter = nodemailer.createTransport({
  host: "smtp.dreamhost.com", // SMTP server
  port: 465, // SMTP Port
  secure: true, // Use SSL/TLS
  auth: {
    user: email, // Your full email address
    pass: pass, // Your email password
  },
});

export const mailOptions = {
  from: email,
  to: email,
};