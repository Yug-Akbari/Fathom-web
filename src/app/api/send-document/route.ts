import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { invoiceEmailTemplate, quotationEmailTemplate } from "@/lib/emailTemplates";

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

    if (type === "Quotation" || type === "Quotation (No GST)" || type.includes("Quotation")) {
      subject = "Your Quotation from FATHOM";

      // Calculate valid-until date (10 days from quotation date)
      let validUntil = '';
      if (documentData?.quotationDate) {
        try {
          const qDate = new Date(documentData.quotationDate);
          qDate.setDate(qDate.getDate() + 10);
          validUntil = qDate.toISOString().split('T')[0];
        } catch {
          validUntil = '';
        }
      }

      htmlContent = quotationEmailTemplate({
        customerName: customerName || 'Customer',
        quotationDate: documentData?.quotationDate || '',
        validUntil: validUntil,
        grandTotal: documentData?.grandTotal || '0',
      });
    } else {
      subject = `Your ${type || 'Invoice'} from FATHOM`;
      const isTaxInvoice = type === "Tax Invoice";
      htmlContent = invoiceEmailTemplate({
        customerName: customerName || 'Customer',
        invoiceNumber: documentData?.invoiceNumber || '',
        invoiceDate: documentData?.invoiceDate || '',
        grandTotal: documentData?.grandTotal || '0',
        isTaxInvoice: isTaxInvoice
      });
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
