"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, Download, ArrowLeft, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

interface InvoiceItem {
  productName: string;
  hsnCode?: string;
  category: string;
  qty: number;
  rate: number;
  gstPercent: number;
  discountPercent: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  companyName: string;
  companyAddress: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGst: string;
  billingAddress: string;
  shippingSameAsBilling: boolean;
  shippingAddress: string;
  paymentMode: string;
  dueDate: string;
  amountPaid: number;
  items: InvoiceItem[];
  transportCharges: number;
  unloadingCharges: number;
  specialNotes: string;
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  pendingAmount: number;
  status: "Paid" | "Partial" | "Pending";
  createdAt: any;
}

const numberToWords = (num: number): string => {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  if (num.toString().length > 9) return "overflow";
  let n = ("000000000" + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += (Number(n[5]) !== 0) ? ((str !== "") ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) : "";
  return str.trim();
};

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const snap = await getDoc(doc(db, "invoices", invoiceId));
        if (snap.exists()) {
          setInvoice({ id: snap.id, ...snap.data() } as Invoice);
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Standard print dialog allows "Save as PDF"
    window.print();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteDoc(doc(db, "invoices", invoiceId));
        router.push("/admin/invoices");
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const handleMarkPaid = async () => {
    try {
      await updateDoc(doc(db, "invoices", invoiceId), {
        status: "Paid",
        amountPaid: invoice?.grandTotal || 0,
        pendingAmount: 0,
      });
      setInvoice((prev) => prev ? { ...prev, status: "Paid", amountPaid: prev.grandTotal, pendingAmount: 0 } : prev);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleMarkNotPaid = async () => {
    try {
      await updateDoc(doc(db, "invoices", invoiceId), {
        status: "Pending",
        amountPaid: 0,
        pendingAmount: invoice?.grandTotal || 0,
      });
      setInvoice((prev) => prev ? { ...prev, status: "Pending", amountPaid: 0, pendingAmount: prev.grandTotal } : prev);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  };

  const amountInWords = (amount: number) => {
    if (!amount) return "";
    try {
      const words = numberToWords(Math.round(amount));
      return `RUPEES ${words.toUpperCase()} ONLY`;
    } catch (e) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-[#947A26] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <span className="text-lg font-semibold">Invoice not found</span>
        <Link
          href="/admin/invoices"
          className="text-[#947A26] hover:text-[#7a641f] font-bold text-sm"
        >
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  const cgst = (invoice.totalGst || 0) / 2;
  const sgst = (invoice.totalGst || 0) / 2;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Action Bar - Hidden in print */}
      <div className="no-print max-w-[850px] mx-auto mb-6 flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 font-inter">
        <button
          onClick={() => router.push("/admin/invoices")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>
        <div className="flex items-center gap-3">
          {invoice.status !== "Paid" ? (
            <button
              onClick={handleMarkPaid}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </button>
          ) : (
            <button
              onClick={handleMarkNotPaid}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Mark as Not Paid
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#947A26] text-white rounded-lg text-sm font-bold hover:bg-[#7a641f] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print/PDF
          </button>
          <button
            onClick={() => router.push(`/admin/invoices/${invoiceId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-[#f3f4f6] py-10 print:py-0 print:bg-white min-h-screen">
        <div className="print-area max-w-[850px] mx-auto bg-white min-h-[1122px] relative shadow-lg print:shadow-none overflow-hidden font-sans">
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0">
             <Image src="/images/fathom-logo-transparent.png" alt="Watermark" width={600} height={200} className="w-[80%] h-auto object-contain" />
          </div>
          
          <div className="p-12 pb-32 relative z-10">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="pt-2">
                <Image src="/images/fathom-logo-transparent.png" alt="Fathom" width={280} height={85} className="h-14 w-auto object-contain" />
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-1 font-serif">Tax Invoice</h2>
                <p className="text-sm font-semibold text-gray-800 mb-4">#{invoice.invoiceNumber}</p>
                <div className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                  <p>Date: <span className="text-gray-900 font-medium">{formatDate(invoice.invoiceDate)}</span></p>
                  <p>Due Date: <span className="text-gray-900 font-medium">{invoice.dueDate ? formatDate(invoice.dueDate) : "On Receipt"}</span></p>
                </div>
              </div>
            </div>

            {/* Bill To & From */}
            <div className="grid grid-cols-2 gap-12 mb-10 mt-6">
              <div className="text-sm leading-relaxed text-gray-600">
                <p className="text-[10px] font-bold tracking-widest text-[#947A26] uppercase mb-4">FROM</p>
                <p className="font-bold text-gray-900 text-lg mb-2 uppercase">{invoice.companyName || "Shivam Enterprises"}</p>
                <p className="whitespace-pre-line text-sm">{invoice.companyAddress || "Plot No. 442, Industrial Area Phase II,\nPanchkula, Haryana 134113\nIndia"}</p>
                <div className="mt-4 space-y-1">
                  <p><span className="font-semibold text-gray-800">GSTIN:</span> 24AFWFS8557F1Z8</p>
                  <p><span className="font-semibold text-gray-800">Email:</span> accounts@shivamenterprises.com</p>
                </div>
              </div>
              
              <div className="text-sm leading-relaxed text-gray-600">
                <p className="text-[10px] font-bold tracking-widest text-[#947A26] uppercase mb-4">BILL TO</p>
                <p className="font-bold text-gray-900 text-lg mb-2">{invoice.customerName || "The Grand Regency Hotels"}</p>
                <p className="whitespace-pre-line text-sm">{invoice.billingAddress || "12/A, Skyline Towers, Sector 45\nGurugram, Haryana 122003\nIndia"}</p>
                <div className="mt-4 space-y-1">
                  {invoice.customerEmail && <p><span className="font-semibold text-gray-800">Email:</span> {invoice.customerEmail}</p>}
                  {invoice.customerPhone && <p><span className="font-semibold text-gray-800">Contact:</span> {invoice.customerPhone}</p>}
                  {invoice.customerGst && <p><span className="font-semibold text-gray-800">GSTIN:</span> {invoice.customerGst}</p>}
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-10 rounded-lg overflow-hidden flex flex-col pt-4 relative z-10">
              <div className="bg-[#f9fafb]/90 print:bg-transparent px-5 py-3 grid grid-cols-[2.5fr_0.6fr_0.5fr_1fr_1fr_0.8fr_1.2fr] gap-2 items-center text-[9px] font-bold tracking-wider uppercase text-gray-500 rounded-t-lg">
                <div>PRODUCT DESCRIPTION</div>
                <div className="text-center">HSN</div>
                <div className="text-center">QTY</div>
                <div className="text-right">RATE</div>
                <div className="text-right">TAXABLE VAL</div>
                <div className="text-center">GST %</div>
                <div className="text-right">TOTAL (INR)</div>
              </div>
              
              <div className="flex flex-col text-xs divide-y divide-gray-100 bg-white/60 print:bg-transparent">
                {(!invoice.items || invoice.items.length === 0) ? (
                   <div className="py-8 text-center text-gray-400 italic">No items</div>
                ) : (
                  invoice.items.map((item, i) => {
                    const taxableVal = item.rate * item.qty * (1 - item.discountPercent / 100);
                    return (
                      <div key={i} className="px-5 py-5 grid grid-cols-[2.5fr_0.6fr_0.5fr_1fr_1fr_0.8fr_1.2fr] gap-2 items-center text-gray-600">
                        <div>
                          <p className="font-bold text-gray-900 mb-1">{item.productName || "—"}</p>
                          {item.category && <p className="text-[10px] text-gray-500 leading-tight">{item.category}</p>}
                        </div>
                        <div className="text-center font-medium text-gray-800">{item.hsnCode || "—"}</div>
                        <div className="text-center font-medium text-gray-800">{String(item.qty).padStart(2, "0")}</div>
                        <div className="text-right">{formatCurrency(item.rate)}</div>
                        <div className="text-right">{formatCurrency(taxableVal)}</div>
                        <div className="text-center">{item.gstPercent}%</div>
                        <div className="text-right font-bold text-gray-900">{formatCurrency(item.total)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Details Section */}
            <div className="grid grid-cols-[1fr_1.1fr] gap-8 mb-12">
              
              {/* Left Side: Bank Details */}
              <div className="bg-white/60 print:bg-transparent p-6 rounded-lg self-start border border-gray-100/50 shadow-sm mt-3 relative z-10">
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-800 mb-5">BANK DETAILS</p>
                <div className="text-[11px] text-gray-500 space-y-3">
                  <div className="flex justify-between">
                    <span>Bank Name:</span>
                    <span className="font-bold text-gray-900">HDFC Bank Ltd.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>A/C Name:</span>
                    <span className="font-bold text-gray-900 uppercase">Shivam Enterprises</span>
                  </div>
                  <div className="flex justify-between">
                    <span>A/C Number:</span>
                    <span className="font-bold text-gray-900">50200048123491</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IFSC Code:</span>
                    <span className="font-bold text-gray-900">HDFC0000412</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span className="font-bold text-gray-900">Sector 11, Panchkula</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Totals */}
              <div className="text-xs flex flex-col justify-between pt-2 relative z-10">
                <div className="space-y-2.5 px-2 bg-white/60 print:bg-transparent rounded-lg p-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (Taxable Value):</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>CGST ({(invoice.items[0]?.gstPercent || 18) / 2}%):</span>
                    <span>{formatCurrency(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>SGST ({(invoice.items[0]?.gstPercent || 18) / 2}%):</span>
                    <span>{formatCurrency(sgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>IGST (0%):</span>
                    <span>₹0.00</span>
                  </div>
                  {(invoice.transportCharges > 0 || invoice.unloadingCharges > 0) && (
                    <div className="flex justify-between text-gray-600 mt-2">
                      <span>Transport & Handling:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency((invoice.transportCharges || 0) + (invoice.unloadingCharges || 0))}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="bg-[#fcfaf5] px-6 py-4 rounded-lg flex justify-between items-center border border-[#f0e8cb]">
                    <span className="font-extrabold text-[#7a641f] text-sm">Grand Total:</span>
                    <span className="text-2xl font-black text-[#7a641f]">{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                  <p className="text-[8px] tracking-[0.05em] text-gray-400 text-center mt-3 uppercase font-medium">
                    {amountInWords(invoice.grandTotal)}
                  </p>
                </div>
                
                {/* Amount Paid / Pending section */}
                <div className="mt-6 px-2 space-y-2 border-t border-gray-100 pt-4">
                   <div className="flex justify-between text-green-700 font-medium">
                     <span>Amount Paid:</span>
                     <span>{formatCurrency(invoice.amountPaid || 0)}</span>
                   </div>
                   <div className="flex justify-between text-red-600 font-bold">
                     <span>Balance Due:</span>
                     <span>{formatCurrency(invoice.pendingAmount || 0)}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Signature Container (Terms & Conditions removed) */}
            <div className="flex items-end justify-end mt-16 pt-8">
              <div className="w-56 text-center flex flex-col items-center">
                {/* Signature Image Placeholder */}
                <div className="h-16 w-full mb-1 flex justify-center items-center relative z-10">
                  <span className="text-3xl text-gray-300 opacity-60 font-serif italic">Authorised</span>
                </div>
                <div className="border-t border-gray-400 w-full pt-2">
                  <p className="text-[10px] font-bold text-gray-900">Authorized Signatory</p>
                  <p className="text-[8px] text-gray-500 mt-1 uppercase">For Shivam Enterprises</p>
                </div>
              </div>
            </div>

          </div>

          {/* Absolute Footer */}
          <div className="absolute bottom-6 w-full text-center">
             <p className="text-[8px] font-semibold tracking-[0.2em] text-[#a3b1c6] uppercase">
                © 2024 SHIVAM ENTERPRISES. FATHOM IS A REGISTERED TRADEMARK.
             </p>
          </div>

        </div>
      </div>
    </>
  );
}
