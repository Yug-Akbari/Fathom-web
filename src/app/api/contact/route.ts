import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, category, message } = body;

    // Verify we have the required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure the email transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g., fathom.support@gmail.com
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // 1. Email to the support team
    const supportMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to the support email itself
      subject: `New Inquiry from ${name} - ${category || 'General'}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Category:</strong> ${category || 'N/A'}</p>
        <br/>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // 2. Email to the customer (auto-reply)
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for your inquiry - Fathom",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out to Fathom. We have received your inquiry and our team will get back to you shortly.</p>
        <br/>
        <h3>Your Inquiry Details:</h3>
        <p><strong>Category:</strong> ${category || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <br/>
        <p>Best regards,<br/>The Fathom Team</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(supportMailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json(
      { message: "Emails sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
