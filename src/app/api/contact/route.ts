import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { inquiryEmailTemplate } from "@/lib/emailTemplates";

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

    const inquiryUser = process.env.INQUIRY_EMAIL_USER || process.env.EMAIL_USER;
    const inquiryPass = process.env.INQUIRY_EMAIL_PASS || process.env.EMAIL_PASS;
    const noReplyUser = process.env.EMAIL_USER;
    const noReplyPass = process.env.EMAIL_PASS;
    
    console.log("DEBUG EMAIL - Inquiry User:", inquiryUser ? "Loaded" : "Missing");
    console.log("DEBUG EMAIL - NoReply User:", noReplyUser ? "Loaded" : "Missing");

    // Configure the inquiry email transporter
    const inquiryTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: inquiryUser,
        pass: inquiryPass,
      },
    });

    // Configure the no-reply email transporter
    const noReplyTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: noReplyUser,
        pass: noReplyPass,
      },
    });

    const receiverEmail = process.env.INQUIRY_RECEIVER_EMAIL || inquiryUser;

    // 1. Email to the support team
    const supportMailOptions = {
      from: inquiryUser,
      to: receiverEmail, // Send to the configured receiver email
      replyTo: email, // This allows the support team to click 'Reply' and reply directly to the customer
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

    // Format date like "19 Mar 2026, 04:30 PM"
    const now = new Date();
    const dateOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const inquiryDate = `${now.toLocaleDateString('en-GB', dateOpts)}, ${now.toLocaleTimeString('en-US', timeOpts)}`;
    
    // Generate short tag reference
    const tagReference = Math.random().toString(36).substring(2, 6).toLowerCase();

    // 2. Email to the customer (auto-reply)
    const customerMailOptions = {
      from: noReplyUser,
      to: email,
      subject: "Thank you for your inquiry - FATHOM",
      html: inquiryEmailTemplate({
        customerName: name,
        inquiryDate: inquiryDate,
        category: category || 'General Inquiry',
        message: message,
        tagReference: tagReference
      }),
    };

    // Send both emails
    await inquiryTransporter.sendMail(supportMailOptions);
    await noReplyTransporter.sendMail(customerMailOptions);

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
