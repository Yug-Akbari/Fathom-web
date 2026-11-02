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

    const inquiryUser = process.env.INQUIRY_EMAIL_USER || "support@fathomstore.in";
    const inquiryPass = process.env.INQUIRY_EMAIL_PASS || process.env.EMAIL_PASS;
    const receiverEmail = process.env.INQUIRY_RECEIVER_EMAIL || "fathom.support@gmail.com";

    // Configure the inquiry email transporter using support@fathomstore.in
    const inquiryTransporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: inquiryUser,
        pass: inquiryPass,
      },
    });

    // 1. Email notification to the support team (received at fathom.support@gmail.com)
    const supportMailOptions = {
      from: `"FATHOM Inquiries" <${inquiryUser}>`,
      to: receiverEmail, // Sends to fathom.support@gmail.com
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

    // 2. Email to the customer acknowledging inquiry (sent from support@fathomstore.in)
    const customerMailOptions = {
      from: `"FATHOM Support" <${inquiryUser}>`,
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

    // Send both emails through the support@fathomstore.in transporter
    await inquiryTransporter.sendMail(supportMailOptions);
    await inquiryTransporter.sendMail(customerMailOptions);

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
