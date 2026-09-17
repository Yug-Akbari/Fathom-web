import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const { email, name, memberId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

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
      subject: "Welcome to FATHOM — Membership Confirmed",
      html: welcomeEmailTemplate({
        memberName: name || "Valued Member",
        memberEmail: email,
        memberId: memberId || `FTM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      }),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Welcome email sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}
