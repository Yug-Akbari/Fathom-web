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

interface InvoiceItem {
  productName: string;
  hsnCode: string;
  category: string;
  qty: number;
  rate: number;
  gstPercent: number;
  discountPercent: number;
  total: number;
}

const emptyItem: InvoiceItem = {
  productName: "",
  hsnCode: "",
  category: "",
  qty: 1,
  rate: 0,
  gstPercent: 18,
  discountPercent: 0,
  total: 0,
};



function calculateItemTotal(item: InvoiceItem): number {
  const base = item.rate * item.qty;
  const discounted = base * (1 - item.discountPercent / 100);
  const withGst = discounted * (1 + item.gstPercent / 100);
  return Math.round(withGst * 100) / 100;
}

interface InvoiceFormProps {
  editId?: string;
}

export default function NewInvoicePage({ editId }: InvoiceFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Invoice details
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [companyName, setCompanyName] = useState("Shivam Enterprises");
  const [companyAddress, setCompanyAddress] = useState("");
  const [orderType, setOrderType] = useState("Retail");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Shipping
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");

  // Payment
  const [paymentMode, setPaymentMode] = useState("Card");
  const [dueDate, setDueDate] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }]);

  // Logistics
  const [transportCharges, setTransportCharges] = useState(0);
  const [unloadingCharges, setUnloadingCharges] = useState(0);
  const [specialNotes, setSpecialNotes] = useState("");

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

  // Load existing invoice for editing
  useEffect(() => {
    if (editId) {
      const load = async () => {
        const snap = await getDoc(doc(db, "invoices", editId));
        if (snap.exists()) {
          const data = snap.data();
          setInvoiceDate(data.invoiceDate || "");
          setCompanyName(data.companyName || "Shivam Enterprises");
          setCompanyAddress(data.companyAddress || "");
          setOrderType(data.orderType || "Retail");
          setDeliveryDate(data.deliveryDate || "");
          setCustomerName(data.customerName || "");
          setCustomerPhone(data.customerPhone || "");
          setCustomerEmail(data.customerEmail || "");
          setCustomerGst(data.customerGst || "");
          setBillingAddress(data.billingAddress || "");
          setShippingSameAsBilling(data.shippingSameAsBilling ?? true);
          setShippingAddress(data.shippingAddress || "");
          setPaymentMode(data.paymentMode || "Card");
          setDueDate(data.dueDate || "");
          setAmountPaid(data.amountPaid || 0);
          setItems(
            data.items?.length > 0 ? data.items : [{ ...emptyItem }]
          );
          setTransportCharges(data.transportCharges || 0);
          setUnloadingCharges(data.unloadingCharges || 0);
          setSpecialNotes(data.specialNotes || "");
        }
      };
      load();
    }
  }, [editId]);

  // Calculations
  const calculations = useMemo(() => {
    const updatedItems = items.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.rate * item.qty,
      0
    );
    const totalDiscount = updatedItems.reduce(
      (sum, item) =>
        sum + item.rate * item.qty * (item.discountPercent / 100),
      0
    );
    const totalGst = updatedItems.reduce(
      (sum, item) =>
        sum +
        item.rate *
          item.qty *
          (1 - item.discountPercent / 100) *
          (item.gstPercent / 100),
      0
    );
    const transport = transportCharges + unloadingCharges;
    const grandTotal =
      Math.round(
        (subtotal - totalDiscount + totalGst + transport) * 100
      ) / 100;
    const pendingAmount = Math.max(0, grandTotal - amountPaid);

    return {
      updatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      transport,
      grandTotal,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
    };
  }, [items, transportCharges, unloadingCharges, amountPaid]);

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index].total = calculateItemTotal(updated[index]);
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

  const generateInvoiceNumber = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${num}`;
  };

  const determineStatus = (): "Paid" | "Partial" | "Pending" => {
    if (amountPaid >= calculations.grandTotal && calculations.grandTotal > 0) return "Paid";
    if (amountPaid > 0) return "Partial";
    return "Pending";
  };

  const buildInvoiceData = () => {
    return {
      invoiceNumber: editId ? undefined : generateInvoiceNumber(),
      invoiceDate,
      deliveryDate,
      companyName,
      companyAddress,
      orderType,
      customerName,
      customerPhone,
      customerEmail,
      customerGst,
      billingAddress,
      shippingSameAsBilling,
      shippingAddress: shippingSameAsBilling
        ? billingAddress
        : shippingAddress,
      paymentMode,
      dueDate,
      amountPaid,
      items: calculations.updatedItems,
      transportCharges,
      unloadingCharges,
      specialNotes,
      subtotal: calculations.subtotal,
      totalDiscount: calculations.totalDiscount,
      totalGst: calculations.totalGst,
      grandTotal: calculations.grandTotal,
      pendingAmount: calculations.pendingAmount,
      status: determineStatus(),
      updatedAt: serverTimestamp(),
    };
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const data = buildInvoiceData();
      if (editId) {
        const { invoiceNumber, ...rest } = data;
        await updateDoc(doc(db, "invoices", editId), rest);
      } else {
        await addDoc(collection(db, "invoices"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      router.push("/admin/invoices");
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
      const data = buildInvoiceData();
      if (editId) {
        const { invoiceNumber, ...rest } = data;
        await updateDoc(doc(db, "invoices", editId), rest);
        router.push(`/admin/invoices/${editId}`);
      } else {
        const docRef = await addDoc(collection(db, "invoices"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        router.push(`/admin/invoices/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice.");
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
            {editId ? "Edit Invoice" : "New Sales Invoice"}
          </h1>
          <p className="text-gray-500 text-sm">
            Generate a professional tax invoice for kitchen appliance orders.
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
                router.push(`/admin/invoices/${editId}`);
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
        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {sectionHeader(
            <FileText className="w-4 h-4" />,
            "Invoice Details"
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
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
                <label className={labelClass}>GST Number / Tax ID</label>
                <input
                  type="text"
                  value={customerGst}
                  onChange={(e) => setCustomerGst(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  className={inputClass}
                />
              </div>
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
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 w-[24%]">
                  Product Name & Category
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[10%]">
                  HSN
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[8%]">
                  Qty
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[14%]">
                  Rate (₹)
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[10%]">
                  GST %
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center w-[12%]">
                  Discount (%)
                </th>
                <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 text-right w-[16%]">
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
                      type="text"
                      value={item.hsnCode || ""}
                      onChange={(e) =>
                        updateItem(index, "hsnCode", e.target.value)
                      }
                      placeholder="HSN"
                      className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
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
                      className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.discountPercent}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "discountPercent",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={100}
                      className="w-full text-center px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-bold text-primary text-sm">
                      {formatCurrency(calculateItemTotal(item))}
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

      {/* Logistics & Notes + Final Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logistics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {sectionHeader(
            <Truck className="w-4 h-4" />,
            "Logistic Charges & Notes"
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Transport Charges (₹)</label>
                <input
                  type="number"
                  value={transportCharges}
                  onChange={(e) =>
                    setTransportCharges(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Unloading/Installation (₹)
                </label>
                <input
                  type="number"
                  value={unloadingCharges}
                  onChange={(e) =>
                    setUnloadingCharges(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Special Instructions / Notes</label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Mention any specific installation requirements or warranty terms discussed..."
                className={`${inputClass} min-h-[100px] resize-y`}
              />
            </div>
          </div>
        </div>

        {/* Final Bill Summary */}
        <div className="bg-[#FAF9F6] rounded-xl border border-accent/20 shadow-sm p-6 flex flex-col">
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent mb-5">
            Final Bill Summary
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-primary">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Item Discount</span>
              <span className="font-semibold text-red-500">
                -{formatCurrency(calculations.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated GST (18%)</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(calculations.totalGst)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transport & Handling</span>
              <span className="font-semibold text-primary">
                {formatCurrency(calculations.transport)}
              </span>
            </div>
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
              Confirm & Authorize Invoice
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
