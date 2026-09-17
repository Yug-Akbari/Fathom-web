import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { otpEmailTemplate } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP in Firestore with an expiration time (e.g., 10 minutes)
    const expirationTime = Date.now() + 10 * 60 * 1000;
    
    // Store in 'otps' collection, using the email as document ID
    await setDoc(doc(db, "otps", email), {
      otp: otp,
      expiresAt: expirationTime,
      createdAt: Date.now()
    });

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your FATHOM Registration OTP",
      html: otpEmailTemplate(otp),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
  }
}
