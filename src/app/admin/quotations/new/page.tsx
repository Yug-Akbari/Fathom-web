"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  User,
  CreditCard,
  Building2,
  Banknote,
  MapPin,
  Package,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Save,
  Upload,
  UserPlus,
  PenLine,
  Landmark,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

interface quotationItem {
  productName: string;
  category: string;
  qty: number;
  rate: number;
  gstPercent: number;
  total: number;
}

const emptyItem: quotationItem = {
  productName: "",
  category: "",
  qty: 1,
  rate: 0,
  gstPercent: 18,
  total: 0,
};

function calculateItemTotal(item: quotationItem, includeGst: boolean): number {
  const base = item.rate * item.qty;
  if (includeGst) {
    const gstAmount = base * (item.gstPercent / 100);
    return Math.round((base + gstAmount) * 100) / 100;
  }
  return Math.round(base * 100) / 100;
}

interface quotationFormProps {
  editId?: string;
}

export default function NewquotationPage({ editId }: quotationFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // quotation details
  const [quotationDate, setquotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [companyName, setCompanyName] = useState("Shivam Enterprises");
  const [companyAddress, setCompanyAddress] = useState("126, Green Plaza, Near Golden Chowk, Mota Varachha, Surat, Gujarat - 394101");
  const [orderType, setOrderType] = useState("Retail");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Shipping
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");

  // GST
  const [gstApplicable, setGstApplicable] = useState(false);
  const [customerGst, setCustomerGst] = useState("");

  // Payment
  const [paymentMode, setPaymentMode] = useState("Card");
  const [dueDate, setDueDate] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  // Line items
  const [items, setItems] = useState<quotationItem[]>([{ ...emptyItem }]);

  // Terms & Conditions
  const [termsList, setTermsList] = useState<string[]>([""]);

  // Signature
  const [showSignature, setShowSignature] = useState(true);

  // Products from Firebase (for autocomplete)
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, []);

  // Load existing quotation for editing
  useEffect(() => {
    if (editId) {
      const load = async () => {
        const snap = await getDoc(doc(db, "quotations", editId));
        if (snap.exists()) {
          const data = snap.data();
          setquotationDate(data.quotationDate || "");
          setCompanyName(data.companyName || "Shivam Enterprises");
          setCompanyAddress(data.companyAddress || "");
          setOrderType(data.orderType || "Retail");
          setDeliveryDate(data.deliveryDate || "");
          setCustomerName(data.customerName || "");
          setCustomerPhone(data.customerPhone || "");
          setCustomerEmail(data.customerEmail || "");
          setBillingAddress(data.billingAddress || "");
          setShippingSameAsBilling(data.shippingSameAsBilling ?? true);
          setShippingAddress(data.shippingAddress || "");
          setGstApplicable(data.gstApplicable ?? false);
          setCustomerGst(data.customerGst || "");
          setPaymentMode(data.paymentMode || "Card");
          setDueDate(data.dueDate || "");
          setAmountPaid(data.amountPaid || 0);
          setItems(
            data.items?.length > 0 ? data.items : [{ ...emptyItem }]
          );
          setTermsList(data.termsAndConditions ? data.termsAndConditions.split('\n') : [""]);
          setShowSignature(data.showSignature ?? true);
        }
      };
      load();
    }
  }, [editId]);

  // Calculations
  const calculations = useMemo(() => {
    const updatedItems = items.map((item) => ({
      ...item,
      total: calculateItemTotal(item, gstApplicable),
    }));

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.rate * item.qty,
      0
    );
    const totalGst = gstApplicable
      ? updatedItems.reduce(
          (sum, item) =>
            sum + item.rate * item.qty * (item.gstPercent / 100),
          0
        )
      : 0;
    const grandTotal =
      Math.round(
        (subtotal + totalGst) * 100
      ) / 100;
    const pendingAmount = Math.max(0, grandTotal - amountPaid);

    return {
      updatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      grandTotal,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
    };
  }, [items, amountPaid, gstApplicable]);

  const updateItem = (
    index: number,
    field: keyof quotationItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index].total = calculateItemTotal(updated[index], gstApplicable);
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const generatequotationNumber = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `QUO-${num}`;
  };

  const determineStatus = (): "Paid" | "Partial" | "Pending" => {
    if (amountPaid >= calculations.grandTotal && calculations.grandTotal > 0) return "Paid";
    if (amountPaid > 0) return "Partial";
    return "Pending";
  };

  const buildquotationData = () => {
    return {
      quotationNumber: editId ? undefined : generatequotationNumber(),
      quotationDate,
      deliveryDate,
      companyName,
      companyAddress,
      orderType,
      customerName,
      customerPhone,
      customerEmail,
      billingAddress,
      shippingSameAsBilling,
      shippingAddress: shippingSameAsBilling
        ? billingAddress
        : shippingAddress,
      gstApplicable,
      customerGst: gstApplicable ? customerGst : "",
      paymentMode,
      dueDate,
      amountPaid,
      items: calculations.updatedItems,
      termsAndConditions: termsList.filter(t => t.trim() !== "").join('\n'),
      subtotal: calculations.subtotal,
      totalGst: calculations.totalGst,
      grandTotal: calculations.grandTotal,
      pendingAmount: calculations.pendingAmount,
      status: determineStatus(),
      showSignature,
      updatedAt: serverTimestamp(),
    };
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const data = buildquotationData();
      if (editId) {
        const { quotationNumber, ...rest } = data;
        await updateDoc(doc(db, "quotations", editId), rest);
      } else {
        await addDoc(collection(db, "quotations"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      router.push("/admin/quotations");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleConfirm = async () => {
    if (!customerName.trim()) {
      alert("Please enter a customer name.");
      return;
    }
    if (items.every((item) => !item.productName.trim())) {
      alert("Please add at least one product.");
      return;
    }

    setIsLoading(true);
    try {
      const data = buildquotationData();
      if (editId) {
        const { quotationNumber, ...rest } = data;
        await updateDoc(doc(db, "quotations", editId), rest);
        router.push(`/admin/quotations/${editId}`);
      } else {
        const docRef = await addDoc(collection(db, "quotations"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        router.push(`/admin/quotations/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Failed to save quotation.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-primary">
        {title}
      </h3>
    </div>
  );

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-400";
  const labelClass =
    "text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 max-w-6xl mx-auto font-inter"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-1">
            {editId ? "Edit quotation" : "New Sales quotation"}
          </h1>
          <p className="text-gray-500 text-sm">
            Generate a professional tax quotation for kitchen appliance orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => {
              if (editId) {
                router.push(`/admin/quotations/${editId}`);
              }
            }}
            disabled={!editId}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            <Printer className="w-4 h-4" />
            Print Preview
          </button>
        </div>
      </div>

      {/* Main form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* quotation Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {sectionHeader(
            <FileText className="w-4 h-4" />,
            "quotation Details"
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>quotation Date</label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setquotationDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Shivam Enterprises"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Company Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Street, City, State, Zip Code"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-primary">
                Customer Information
              </h3>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              New Client
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Client Name / Business Entity</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Search existing customers or enter new..."
                className={inputClass}
                list="customer-suggestions"
              />
              <datalist id="customer-suggestions">
                {products
                  .map((p) => p.name)
                  .filter(Boolean)
                  .map((name: string, i: number) => (
                    <option key={i} value={name} />
                  ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@example.com"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Billing Address</label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, City, State, Zip Code"
                  className={inputClass}
                />
              </div>
            </div>

            {/* GST Toggle & Number */}
            <div className="border-t border-gray-100 pt-4 mt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGstApplicable(!gstApplicable)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    gstApplicable ? "bg-accent" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      gstApplicable ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer" onClick={() => setGstApplicable(!gstApplicable)}>
                  GST Applicable
                </label>
              </div>

              {gstApplicable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <label className={labelClass}>GST Number (GSTIN)</label>
                  <input
                    type="text"
                    value={customerGst}
                    onChange={(e) => setCustomerGst(e.target.value.toUpperCase())}
                    placeholder="e.g. 24AABCU9603R1ZM"
                    maxLength={15}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">15-character alphanumeric GST Identification Number</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms + Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Terms */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {sectionHeader(
            <CreditCard className="w-4 h-4" />,
            "Payment Terms"
          )}

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Payment Mode</label>
              <div className="flex gap-2">
                {[
                  { value: "Card", icon: <CreditCard className="w-4 h-4" />, label: "Card" },
                  { value: "Bank", icon: <Building2 className="w-4 h-4" />, label: "Bank" },
                  { value: "Cash", icon: <Banknote className="w-4 h-4" />, label: "Cash" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setPaymentMode(mode.value)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                      paymentMode === mode.value
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-primary">
              Shipping same as Billing?
            </h3>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Enable to copy address details.
          </p>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setShippingSameAsBilling(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                shippingSameAsBilling
                  ? "bg-accent text-white border-accent"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setShippingSameAsBilling(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                !shippingSameAsBilling
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              No, Enter Different
            </button>
          </div>

          {!shippingSameAsBilling && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className={labelClass}>Shipping Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter full shipping address..."
                className={`${inputClass} min-h-[80px] resize-y`}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Line Items */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-primary">
              Product Line Items
            </h3>
          </div>
          <button className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Bulk Import
          </button>
        </div>

        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 w-[30%]">
                  Product Name & Category
                </th>

                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[10%]">
                  Qty
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[16%]">
                  Rate (₹)
                </th>

                {gstApplicable && (
                  <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[12%]">
                    GST (%)
                  </th>
                )}
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-right w-[18%]">
                  Total (₹)
                </th>
                <th className="pb-3 w-[6%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, index) => (
                <tr key={index} className="group">
                  <td className="py-3 pr-3">
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(index, "productName", e.target.value)
                      }
                      placeholder="Product name"
                      className="w-full px-3 py-2 bg-transparent border-0 text-sm font-semibold text-primary focus:outline-none focus:bg-gray-50 rounded"
                      list={`product-list-${index}`}
                    />
                    <datalist id={`product-list-${index}`}>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) =>
                        updateItem(index, "category", e.target.value)
                      }
                      placeholder="Category"
                      className="w-full px-3 py-1 bg-transparent border-0 text-xs text-accent focus:outline-none focus:bg-gray-50 rounded uppercase tracking-wide"
                    />
                  </td>

                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "qty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={1}
                      className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      step={0.01}
                      className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>

                  {gstApplicable && (
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.gstPercent}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "gstPercent",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min={0}
                        max={100}
                        className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </td>
                  )}
                  <td className="py-3 px-2 text-right">
                    <span className="font-bold text-primary text-sm">
                      {formatCurrency(calculateItemTotal(item, gstApplicable))}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item */}
        <button
          onClick={addItem}
          className="flex items-center gap-2 mt-4 text-sm font-bold text-accent hover:text-[#c5a130] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product Item
        </button>
      </div>

            {/* Final Bill Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
          {sectionHeader(
            <FileText className="w-4 h-4" />,
            "Terms & Conditions"
          )}
          <div className="flex-1 flex flex-col gap-3">
            <label className={labelClass}>Manual Conditions</label>
            {termsList.map((term, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const newTerms = [...termsList];
                    newTerms[index] = e.target.value;
                    setTermsList(newTerms);
                  }}
                  placeholder="e.g. Quotation is valid for 30 days."
                  className={inputClass}
                />
                <button
                  onClick={() => {
                    const newTerms = termsList.filter((_, i) => i !== index);
                    setTermsList(newTerms.length ? newTerms : [""]);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setTermsList([...termsList, ""])}
              className="flex items-center gap-2 mt-2 text-sm font-bold text-accent hover:text-[#c5a130] transition-colors self-start"
            >
              <Plus className="w-4 h-4" />
              Add new line
            </button>
          </div>
        </div>
        <div className="bg-[#FAF9F6] rounded-xl border border-accent/20 shadow-sm p-6 flex flex-col">
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent mb-5">
            Final Quotation Summary
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-primary">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>
            {gstApplicable && calculations.totalGst > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">GST</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(calculations.totalGst)}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-accent/20 mt-5 pt-5 flex-1 flex flex-col justify-end">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent mb-1">
              Grand Total Amount
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-poppins font-bold text-primary">
                {formatCurrency(calculations.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Checkbox */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <label className="flex items-center gap-3 cursor-pointer group" htmlFor="showSignature">
          <div className="relative">
            <input
              type="checkbox"
              id="showSignature"
              checked={showSignature}
              onChange={(e) => setShowSignature(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
              showSignature
                ? 'bg-accent border-accent shadow-sm'
                : 'bg-gray-50 border-gray-300 group-hover:border-gray-400'
            }`}>
              {showSignature && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Include Digital Signature on Quotation
            </span>
          </div>
        </label>
        <p className="text-[10px] text-gray-400 mt-1.5 ml-8">
          When checked, the company authorized signature will be printed on the quotation document.
        </p>
      </div>

      {/* Confirm Button */}
      <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-xl border border-accent/20 p-6 flex flex-col items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex items-center gap-3 bg-accent hover:bg-[#c5a130] text-white font-bold text-sm tracking-wide px-10 py-4 rounded-lg transition-all shadow-[0_4px_14px_rgba(212,175,55,0.3)] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Authorize quotation
            </>
          )}
        </button>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
          Legally binding as per FATHOM commercial terms
        </span>
      </div>
    </motion.div>
  );
}
