import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pdfBase64, type, customerEmail, customerName, documentData } = body;

    if (!pdfBase64 || !type || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert base64 back to buffer
    const base64Data = pdfBase64.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let htmlContent = "";
    let subject = "";

    if (type === "Quotation") {
      subject = "Your Quotation from FATHOM";
      htmlContent = `
        <p>Hello ${customerName || 'Customer'},</p>
        <p>Thank you for your interest in FATHOM.</p>
        <p>Please find the quotation for your requested products attached to this email.</p>
        
        <p><strong>Quotation Details:</strong><br/>
        * Quotation Date: ${documentData?.quotationDate || ''}<br/>
        * Valid Until: This quotation is valid for 10 days from the date of issuance. Prices and availability are subject to change after the validity period.<br/>
        * Total Amount: ₹${documentData?.grandTotal || '0'}</p>
        
        <p>The attached quotation includes the product details, quantities, pricing, applicable taxes, and other relevant terms and conditions.</p>
        
        <p>Please review the quotation and feel free to contact us if you have any questions or require any changes.</p>
        
        <p>We look forward to serving you.</p>
        
        <p>Warm regards,<br/>
        Team FATHOM</p>
        
        <p>Website: <a href="https://www.fathomstore.in/">https://www.fathomstore.in/</a><br/>
        Email: fathom.support@gmail.com<br/>
        Phone: +91 82385 43000</p>
      `;
    } else {
      subject = `Your ${type || 'Invoice'} from FATHOM`;
      htmlContent = `
        <p>Hello ${customerName || 'Customer'},</p>
        <p>Thank you for choosing FATHOM.</p>
        <p>Your invoice for Order is attached to this email.</p>
        
        <p><strong>Invoice Details:</strong><br/>
        * Invoice Number: ${documentData?.invoiceNumber || ''}<br/>
        * Order Date: ${documentData?.invoiceDate || ''}<br/>
        * Invoice Amount: ₹${documentData?.grandTotal || '0'}</p>
        
        <p>Please keep this invoice for your records.</p>
        
        <p>We appreciate your trust in FATHOM and look forward to serving you again.</p>
        
        <p>Warm regards,<br/>
        Team FATHOM</p>
        
        <p>Website: <a href="https://www.fathomstore.in/">https://www.fathomstore.in/</a><br/>
        Email: fathom.support@gmail.com<br/>
        Phone: +91 82385 43000</p>
      `;
    }

    // Send email with PDF attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: type === 'Quotation' ? 'Quotation.pdf' : 'Invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending document email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
