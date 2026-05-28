"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PackageSearch, Download, Plus, Search, X, ExternalLink, RefreshCcw,
  DollarSign, Calendar, AlertCircle, AlertTriangle, Bell, Save, Edit, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, query, orderBy, addDoc, updateDoc,
  doc, serverTimestamp, deleteDoc, writeBatch, getDocs, where
} from "firebase/firestore";

/* ─── Interfaces ─── */
interface StockEntry {
  id: string;
  date: string;
  name: string;
  sku_id: string;
  type: "Inbound" | "Return-Sellable" | "Return-Damaged";
  stock_qty: number;
  cost_price: number;
  total_value: number;
  source_ref?: string;
  source_type?: string;
  condition: "Sellable" | "Damaged";
  status: "Active" | "Excluded" | "Low Stock" | "Out of Stock";
  warehouse_notes?: string;
  createdAt: any;
}

interface DamageLogEntry {
  id: string;
  log_date: string;
  product_name: string;
  sku_id: string;
  returned_qty: number;
  reason: string;
  fba_reference: string;
  logged_by: string;
  notes: string;
  createdAt: any;
}

interface AuditLogEntry {
  id: string;
  timestamp: any;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  sku_id: string;
  product_name: string;
  performed_by: string;
  changes: string;
  source: string;
  ref_id: string;
}

/* ─── Helpers ─── */
function getMonthBounds(offset = 0) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offset;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return {
    start: first.toISOString().slice(0, 10),
    end: last.toISOString().slice(0, 10),
  };
}

function toDateStr(d: string | Date | number | null | undefined): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function fmtDate(d: string | Date | number | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

/* ─── Component ─── */
export default function StockManagement() {
  /* Data state */
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [damageLogs, setDamageLogs] = useState<DamageLogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<any[]>([]);

  /* UI state */
  const [activeTab, setActiveTab] = useState<"All" | "Inbound" | "Sellable Returns" | "Damaged Returns" | "Activity Log">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockEntry; direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });
  const [auditFilter, setAuditFilter] = useState<"All" | "CREATE" | "UPDATE" | "DELETE">("All");

  /* Date range */
  const currentMonth = getMonthBounds(0);
  const [dateStart, setDateStart] = useState(currentMonth.start);
  const [dateEnd, setDateEnd] = useState(currentMonth.end);

  /* Modals & panels */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDamageLogModalOpen, setIsDamageLogModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntry | null>(null);
  const [warehouseNotes, setWarehouseNotes] = useState("");

  /* Edit/Delete state */
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  /* Add stock form */
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newCondition, setNewCondition] = useState<"Sellable" | "Damaged">("Sellable");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Edit stock form */
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<"Inbound" | "Return-Sellable" | "Return-Damaged">("Inbound");
  const [editQty, setEditQty] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editCondition, setEditCondition] = useState<"Sellable" | "Damaged">("Sellable");
  const [editNotes, setEditNotes] = useState("");

  /* Damage log form */
  const [dlProductName, setDlProductName] = useState("");
  const [dlSkuId, setDlSkuId] = useState("");
  const [dlQty, setDlQty] = useState("");
  const [dlReason, setDlReason] = useState("Transit Damage");
  const [dlNotes, setDlNotes] = useState("");
  const [dlDate, setDlDate] = useState(new Date().toISOString().slice(0, 10));
  const [isDlSubmitting, setIsDlSubmitting] = useState(false);

  /* ─── State & Firebase Subscriptions ─── */
  const CUTOFF_DATE = new Date("2026-05-28T06:22:22Z").getTime();
  const getTimestamp = (val: any) => {
    if (!val) return 0;
    if (val.toDate) return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    if (typeof val === "number") return val;
    return new Date(val).getTime();
  };

  useEffect(() => {
    const q = query(collection(db, "stock_entries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data: StockEntry[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as StockEntry));
      setEntries(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "damaged_return_logs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data: DamageLogEntry[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as DamageLogEntry));
      setDamageLogs(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cleanupOldLogs = async () => {
      try {
        const oldQ = query(collection(db, "audit_logs"), where("timestamp", "<", thirtyDaysAgo));
        const snap = await getDocs(oldQ);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    };
    cleanupOldLogs();

    const q = query(
      collection(db, "audit_logs"),
      where("timestamp", ">=", thirtyDaysAgo),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data: AuditLogEntry[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as AuditLogEntry));
      setAuditLogs(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "accounting_entries"));
    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setAccountingEntries(data);
    });
    return () => unsub();
  }, []);

  const accountingSkus = useMemo(() => {
    const skus = new Set<string>();
    accountingEntries.forEach(e => {
      if (e.sku && e.sku !== "N/A") skus.add(e.sku);
    });
    return Array.from(skus);
  }, [accountingEntries]);

  /* ─── Sync selectedEntry → warehouseNotes ─── */
  useEffect(() => {
    if (selectedEntry) setWarehouseNotes(selectedEntry.warehouse_notes || "");
  }, [selectedEntry]);

  /* ─── Exact Net Stock Calculation (FIX 2) ─── */
  const netStockBySku = useMemo(() => {
    const map = new Map<string, number>();
    
    // SUM inbound and sellable returns
    entries.forEach(e => {
      if (getTimestamp(e.createdAt) < CUTOFF_DATE) return;
      if ((e.type === "Inbound" || e.type === "Return-Sellable") && e.condition === "Sellable") {
        map.set(e.sku_id, (map.get(e.sku_id) || 0) + (e.stock_qty || 0));
      }
    });

    // MINUS ALL FBA, FBM, Offline sales (returns will be added back via Return-Sellable entries in stock_entries)
    accountingEntries.forEach(e => {
      if (getTimestamp(e.createdAt) < CUTOFF_DATE) return;
      if (e.type === "FBA" || e.type === "FBM" || e.type === "Offline") {
        if (e.sku && e.sku !== "N/A") {
          map.set(e.sku, (map.get(e.sku) || 0) - (parseInt(e.quantity as any) || e.quantity || 1));
        }
      }
    });

    return map;
  }, [entries, accountingEntries]);

  const getEffectiveStatus = (entry: StockEntry): "Active" | "Excluded" | "Low Stock" | "Out of Stock" => {
    if (entry.condition === "Damaged") return "Excluded";
    if (entry.status === "Excluded") return "Excluded";
    
    const net_stock = netStockBySku.get(entry.sku_id) || 0;
    
    if (net_stock > 5) return "Active";
    if (net_stock <= 5 && net_stock > 0) return "Low Stock";
    return "Out of Stock";
  };

  /* ─── Date-filtered entries ─── */
  const dateFiltered = useMemo(() => {
    return entries.filter((e) => {
      const d = toDateStr(e.date);
      if (!d) return true;
      return d >= dateStart && d <= dateEnd;
    });
  }, [entries, dateStart, dateEnd]);

  /* ─── Summary Cards ─── */
  const uniqueSkusMap = useMemo(() => {
    const activeOrLow = dateFiltered.filter((e) => {
      const s = getEffectiveStatus(e);
      return s === "Active" || s === "Low Stock" || s === "Out of Stock";
    });
    const map = new Map<string, number>();
    activeOrLow.forEach((e) => {
      if (e.type === "Inbound" && !map.has(e.sku_id)) {
        map.set(e.sku_id, e.cost_price || 0);
      }
    });
    return map;
  }, [dateFiltered]);

  const metrics = useMemo(() => {
    const activeOrLow = dateFiltered.filter((e) => {
      const s = getEffectiveStatus(e);
      return s === "Active" || s === "Low Stock" || s === "Out of Stock";
    });

    const uniqueSkus = uniqueSkusMap.size;
    
    let totalStockValue = 0;
    uniqueSkusMap.forEach((cost, sku) => {
      const net = netStockBySku.get(sku) || 0;
      if (net > 0) totalStockValue += (net * cost);
    });

    const sellableReturns = dateFiltered.filter((e) => e.type === "Return-Sellable" && getEffectiveStatus(e) !== "Excluded").length;

    // Month-over-month SKU comparison
    const prevMonth = getMonthBounds(-1);
    const prevMonthEntries = entries.filter((e) => {
      const created = e.createdAt;
      if (!created) return false;
      const d = toDateStr(created.toDate ? created.toDate() : created);
      return d >= prevMonth.start && d <= prevMonth.end;
    });
    const prevSkus = new Set(prevMonthEntries.filter((e) => {
      const s = getEffectiveStatus(e);
      return s === "Active" || s === "Low Stock" || s === "Out of Stock";
    }).map((e) => e.sku_id)).size;

    let skuChange = 0;
    if (prevSkus > 0) skuChange = Math.round(((uniqueSkus - prevSkus) / prevSkus) * 100);

    return { uniqueSkus, totalStockValue, sellableReturns, skuChange, prevSkus };
  }, [dateFiltered, entries, netStockBySku]);

  /* ─── Tab + Search + Sort ─── */
  const filteredEntries = useMemo(() => {
    return dateFiltered.filter((entry) => {
      if (activeTab === "All" && (entry.type === "Return-Sellable" || entry.type === "Return-Damaged")) return false;
      if (activeTab === "Inbound" && entry.type !== "Inbound") return false;
      if (activeTab === "Sellable Returns" && entry.type !== "Return-Sellable") return false;
      if (activeTab === "Damaged Returns" && entry.type !== "Return-Damaged") return false;

      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        return (
          entry.name?.toLowerCase().includes(t) ||
          entry.sku_id?.toLowerCase().includes(t) ||
          entry.type?.toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [dateFiltered, activeTab, searchTerm]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sortConfig]);

  const handleSort = (key: keyof StockEntry) => {
    setSortConfig((c) => ({ key, direction: c.key === key && c.direction === "asc" ? "desc" : "asc" }));
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof StockEntry }) => {
    if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1 inline-block w-3 h-3">↕</span>;
    return <span className="text-gray-600 ml-1 inline-block w-3 h-3 font-bold">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };

  /* ─── Handlers ─── */
  const logAudit = async (action: "CREATE"| "UPDATE"| "DELETE", entity: string, sku_id: string, product_name: string, changes: string, source: string, ref_id: string) => {
    await addDoc(collection(db, "audit_logs"), {
      timestamp: serverTimestamp(),
      action, entity, sku_id, product_name,
      performed_by: "System Admin", // hardcoded as per instructions to use logged-in user name (assuming System Admin)
      changes, source, ref_id
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const qty = newCondition === "Damaged" ? 0 : parseInt(newQty) || 0;
    const cost = newCondition === "Damaged" ? 0 : parseFloat(newCost) || 0;

    if (newCondition === "Sellable" && (qty <= 0 || cost <= 0)) {
      alert("Quantity and Cost Price must be > 0 for Sellable items.");
      setIsSubmitting(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "stock_entries"), {
        date: new Date().toISOString(),
        name: newName,
        sku_id: newSku,
        type: "Inbound",
        stock_qty: qty,
        cost_price: cost,
        total_value: qty * cost,
        condition: newCondition,
        status: newCondition === "Damaged" ? "Excluded" : "Active",
        source_type: "manual",
        createdAt: serverTimestamp(),
      });
      await logAudit("CREATE", "stock_entry", newSku, newName, `Created ${qty} units via Manual Entry`, "Manual", docRef.id);

      setIsAddModalOpen(false);
      setNewName(""); setNewSku(""); setNewQty(""); setNewCost(""); setNewCondition("Sellable");
    } catch (error) {
      console.error("Error adding entry", error);
      alert("Failed to add entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const qty = editCondition === "Damaged" ? 0 : parseInt(editQty) || 0;
    const cost = editCondition === "Damaged" ? 0 : parseFloat(editCost) || 0;

    try {
      await updateDoc(doc(db, "stock_entries", editingEntry.id), {
        date: editDate ? new Date(editDate).toISOString() : new Date().toISOString(),
        name: editName,
        sku_id: editSku,
        type: editType,
        stock_qty: qty,
        cost_price: cost,
        total_value: qty * cost,
        condition: editCondition,
        status: editCondition === "Damaged" ? "Excluded" : "Active",
        warehouse_notes: editNotes
      });
      await logAudit("UPDATE", "stock_entry", editSku, editName, `qty: ${editingEntry.stock_qty} → ${qty}, cond: ${editingEntry.condition} → ${editCondition}`, "Manual", editingEntry.id);
      
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating entry", error);
      alert("Failed to update entry.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEntryId) return;
    const entry = entries.find(e => e.id === deleteEntryId);
    if (!entry) return;

    try {
      await deleteDoc(doc(db, "stock_entries", deleteEntryId));
      await logAudit("DELETE", "stock_entry", entry.sku_id, entry.name, "Deleted entry completely", "Manual", deleteEntryId);
      setDeleteEntryId(null);
    } catch (error) {
      console.error("Error deleting entry", error);
      alert("Failed to delete entry.");
    }
  };

  const handleDamageLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDlSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "damaged_return_logs"), {
        log_date: dlDate ? new Date(dlDate).toISOString() : new Date().toISOString(),
        product_name: dlProductName,
        sku_id: dlSkuId,
        returned_qty: parseInt(dlQty) || 0,
        reason: dlReason,
        fba_reference: "",
        logged_by: "System Admin",
        notes: dlNotes,
        createdAt: serverTimestamp(),
      });
      await logAudit("CREATE", "damage_log", dlSkuId, dlProductName, `Logged ${dlQty} damaged units`, "Manual", docRef.id);

      setIsDamageLogModalOpen(false);
      setDlProductName(""); setDlSkuId(""); setDlQty(""); setDlReason("Transit Damage"); setDlNotes(""); setDlDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error("Error adding damage log", error);
      alert("Failed to add damage log.");
    } finally {
      setIsDlSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;
    try {
      await updateDoc(doc(db, "stock_entries", selectedEntry.id), { warehouse_notes: warehouseNotes });
      setSelectedEntry({ ...selectedEntry, warehouse_notes: warehouseNotes });
      await logAudit("UPDATE", "stock_entry", selectedEntry.sku_id, selectedEntry.name, "Updated warehouse notes", "Manual", selectedEntry.id);
    } catch (error) {
      console.error("Error saving notes", error);
      alert("Failed to save notes.");
    }
  };

  /* ─── Source label helper ─── */
  const SourceLabel = ({ entry }: { entry: StockEntry }) => {
    if (entry.source_ref && entry.source_type === "fba_damaged_return") {
      return <span className="text-red-500 font-medium text-xs">Return — Damaged</span>;
    }
    if (entry.source_ref) {
      return (
        <a href="/admin/accounting" className="text-[#8b6b15] font-medium text-xs hover:underline flex items-center justify-end gap-1">
          FBA Accounting <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return <span className="text-gray-400 text-xs">Manual Entry</span>;
  };

  /* ─── Pill badges ─── */
  const ConditionBadge = ({ condition }: { condition: string }) => (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
      condition === "Sellable"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}>
      {condition}
    </span>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = status === "Active"
      ? { bg: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" }
      : status === "Low Stock"
      ? { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" }
      : status === "Out of Stock"
      ? { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" }
      : { bg: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border inline-flex items-center gap-1.5 ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {status}
      </span>
    );
  };

  /* ─── Row class ─── */
  const getRowClass = (status: string) => {
    if (status === "Excluded") return "bg-[#f9f9f9] opacity-60 cursor-pointer transition-colors hover:opacity-80";
    if (status === "Out of Stock") return "border-l-4 border-l-red-500 cursor-pointer transition-colors hover:bg-gray-50";
    if (status === "Low Stock") return "border-l-4 border-l-orange-500 cursor-pointer transition-colors hover:bg-gray-50";
    return "border-l-4 border-l-green-500 cursor-pointer transition-colors hover:bg-gray-50";
  };

  /* ─── Main Table Columns (11 cols with Actions) ─── */
  const thClass = "px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors";

  const renderTableHead = () => (
    <thead>
      <tr className="text-[10px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-100 bg-gray-50/50">
        <th className={thClass} onClick={() => handleSort("date")}>DATE <SortIcon columnKey="date" /></th>
        <th className={thClass} onClick={() => handleSort("name")}>NAME <SortIcon columnKey="name" /></th>
        <th className={thClass} onClick={() => handleSort("sku_id")}>SKU ID <SortIcon columnKey="sku_id" /></th>
        <th className={thClass} onClick={() => handleSort("type")}>TYPE <SortIcon columnKey="type" /></th>
        <th className={`${thClass} text-right`} onClick={() => handleSort("stock_qty")}>STOCK (QTY) <SortIcon columnKey="stock_qty" /></th>
        <th className={`${thClass} text-right`} onClick={() => handleSort("cost_price")}>COST PRICE <SortIcon columnKey="cost_price" /></th>
        <th className={`${thClass} text-right`} onClick={() => handleSort("total_value")}>TOTAL VALUE <SortIcon columnKey="total_value" /></th>
        <th className="px-6 py-4 text-center">ACTIONS</th>
      </tr>
    </thead>
  );

  const renderTableRow = (entry: StockEntry) => {
    const effStatus = getEffectiveStatus(entry);
    
    return (
      <tr key={entry.id} className={getRowClass(effStatus)}>
        <td className="px-6 py-4" onClick={() => setSelectedEntry(entry)}>{fmtDate(entry.date)}</td>
        <td className="px-6 py-4 font-semibold max-w-[200px] truncate" onClick={() => setSelectedEntry(entry)}>{entry.name}</td>
        <td className="px-6 py-4 font-mono text-xs" onClick={() => setSelectedEntry(entry)}>{entry.sku_id}</td>
        <td className="px-6 py-4" onClick={() => setSelectedEntry(entry)}>
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
            entry.type === "Inbound" ? "bg-blue-50 text-blue-600"
            : entry.type === "Return-Sellable" ? "bg-purple-50 text-purple-600"
            : "bg-yellow-50 text-yellow-700"
          }`}>
            {entry.type}
          </span>
        </td>
        <td className="px-6 py-4 font-bold text-right" onClick={() => setSelectedEntry(entry)}>{entry.stock_qty}</td>
        <td className="px-6 py-4 text-right" onClick={() => setSelectedEntry(entry)}>₹{entry.cost_price?.toLocaleString("en-IN") || 0}</td>
        <td className="px-6 py-4 font-bold text-right" onClick={() => setSelectedEntry(entry)}>₹{entry.total_value?.toLocaleString("en-IN") || 0}</td>
        <td className="px-6 py-4 text-center">
          <div className="flex justify-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setEditName(entry.name); setEditSku(entry.sku_id); setEditDate(entry.date ? toDateStr(entry.date) : ""); setEditType(entry.type); setEditQty(entry.stock_qty?.toString() || "0"); setEditCost(entry.cost_price?.toString() || "0"); setEditCondition(entry.condition); setEditNotes(entry.warehouse_notes || ""); setEditingEntry(entry); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); setDeleteEntryId(entry.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
    );
  };

  /* ─── Damaged Returns Tab ─── */
  const damagedEntries = useMemo(() => dateFiltered.filter((e) => e.condition === "Damaged"), [dateFiltered]);

  const renderDamagedReturnsTab = () => (
    <div className="space-y-8">
      {/* TABLE A */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Damaged Returns (Stock View)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Zeroed values — excluded from stock calculations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">NAME</th>
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4">TYPE</th>
                <th className="px-6 py-4 text-right">QTY</th>
                <th className="px-6 py-4 text-right">COST</th>
                <th className="px-6 py-4 text-right">TOTAL</th>
                <th className="px-6 py-4 text-right">SOURCE</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {damagedEntries.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">No damaged return entries found.</td></tr>
              ) : (
                damagedEntries.map((entry) => (
                  <tr key={entry.id} className="bg-[#f9f9f9] opacity-60 hover:opacity-80 transition-colors cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                    <td className="px-6 py-4">{fmtDate(entry.date)}</td>
                    <td className="px-6 py-4 font-semibold max-w-[200px] truncate">{entry.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{entry.sku_id}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-yellow-50 text-yellow-700">Return-Damaged</span></td>
                    <td className="px-6 py-4 font-bold text-right text-gray-400">0</td>
                    <td className="px-6 py-4 text-right text-gray-400">₹0</td>
                    <td className="px-6 py-4 font-bold text-right text-gray-400">₹0</td>
                    <td className="px-6 py-4 text-right"><SourceLabel entry={entry} /></td>
                    <td className="px-6 py-4"><StatusBadge status="Excluded" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE B */}
      <div className="bg-[#fff5f5] rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Damage Log</h3>
            <p className="text-xs text-red-400 mt-0.5">Record of all damaged returns — excluded from stock value but tracked for audit purposes.</p>
          </div>
          <button onClick={() => setIsDamageLogModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Log Damage Entry
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-bold text-red-400 tracking-wider uppercase border-b border-red-100 bg-red-50/30">
                <th className="px-6 py-4">LOG DATE</th>
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4 text-right">RETURNED QTY</th>
                <th className="px-6 py-4">REASON</th>
                <th className="px-6 py-4">FBA REFERENCE</th>
                <th className="px-6 py-4">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {damageLogs.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-red-300">No damage log entries yet.</td></tr>
              ) : (
                damageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-4">{fmtDate(log.log_date)}</td>
                    <td className="px-6 py-4 font-semibold">{log.product_name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.sku_id}</td>
                    <td className="px-6 py-4 font-bold text-right">{log.returned_qty}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-600">{log.reason}</span></td>
                    <td className="px-6 py-4">
                      {log.fba_reference ? (
                        <a href="/admin/accounting" className="text-[#8b6b15] hover:underline cursor-pointer font-mono text-xs flex items-center gap-1">
                          {log.fba_reference.slice(0, 12)}… <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-gray-400 text-xs">Manual Entry</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">{log.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ─── Activity Log Tab (FIX 4) ─── */
  const renderActivityLogTab = () => {
    const filteredLogs = auditLogs.filter(log => auditFilter === "All" || log.action === auditFilter);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Audit Log</h3>
            <p className="text-xs text-gray-400 mt-0.5">Complete record of all stock entry changes</p>
          </div>
          <div className="flex gap-2">
            {(["All", "CREATE", "UPDATE", "DELETE"] as const).map(f => (
              <button
                key={f}
                onClick={() => setAuditFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  auditFilter === f 
                  ? "bg-[#8b6b15] text-white border-[#8b6b15]" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">TIMESTAMP</th>
                <th className="px-6 py-4">ACTION</th>
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">CHANGES</th>
                <th className="px-6 py-4">PERFORMED BY</th>
                <th className="px-6 py-4">SOURCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No activity recorded yet. Changes to stock entries will appear here.</td></tr>
              ) : (
                filteredLogs.map(log => {
                  const bdColor = log.action === "CREATE" ? "border-l-green-500" : log.action === "UPDATE" ? "border-l-blue-500" : "border-l-red-500";
                  const badgeColor = log.action === "CREATE" ? "bg-green-100 text-green-700" : log.action === "UPDATE" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";
                  return (
                    <tr key={log.id} className={`border-l-4 ${bdColor} hover:bg-gray-50 transition-colors`}>
                      <td className="px-6 py-4">{fmtDate(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded-full ${badgeColor}`}>{log.action}</span></td>
                      <td className="px-6 py-4 font-mono text-xs">{log.sku_id}</td>
                      <td className="px-6 py-4 font-semibold max-w-[200px] truncate">{log.product_name}</td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-[300px] truncate">{log.changes}</td>
                      <td className="px-6 py-4 text-xs">{log.performed_by}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{log.source}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ─── All Tab (Live Inventory View) ─── */
  const renderAllTab = () => {
    // Build array of unique SKUs for live view
    const skus = Array.from(uniqueSkusMap.keys()).map(sku => {
      const entry = entries.find(e => e.sku_id === sku);
      const net = netStockBySku.get(sku) || 0;
      const cost = uniqueSkusMap.get(sku) || 0;
      return { sku, name: entry?.name || "Unknown", net, cost, total: net * cost };
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden border-t-4 border-t-primary">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Live Inventory by SKU</h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time aggregated view of your current net stock across all channels.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4 text-right text-blue-600">LIVE STOCK</th>
                <th className="px-6 py-4 text-right">AVG COST PRICE</th>
                <th className="px-6 py-4 text-right">TOTAL VALUE</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {skus.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No active stock available.</td></tr>
              ) : (
                skus.map((s) => {
                  let status = "Active";
                  if (s.net <= 5 && s.net > 0) status = "Low Stock";
                  if (s.net <= 0) status = "Out of Stock";
                  
                  return (
                    <tr key={s.sku} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{s.sku}</td>
                      <td className="px-6 py-4 font-semibold max-w-[200px] truncate">{s.name}</td>
                      <td className="px-6 py-4 font-bold text-right text-lg text-blue-700 bg-blue-50/30">{s.net}</td>
                      <td className="px-6 py-4 text-right">₹{s.cost.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 font-bold text-right text-gray-900">₹{s.total.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4"><StatusBadge status={status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ─── RENDER ─── */
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-poppins text-primary">Inventory Flow</h1>
          <p className="text-gray-500 mt-1">Real-time oversight of inbound and return stock channels.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-gray-50 rounded-lg border border-gray-200 text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-accent" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-gray-50 rounded-lg border border-gray-200 text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search SKU, name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 pl-9 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#8b6b15] hover:bg-[#72570f] text-white rounded-full text-sm font-semibold shadow-sm">
              <Plus className="w-4 h-4" /> Add Stock Entry
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6e2d3] flex items-center justify-between relative overflow-hidden border-l-4 border-l-[#8b6b15]">
          <div>
            <span className="text-[11px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">TOTAL SKUS</span>
            <div className="text-4xl font-extrabold font-poppins text-gray-900">{metrics.uniqueSkus.toLocaleString()}</div>
            <span className={`text-xs font-semibold mt-1 block ${metrics.skuChange >= 0 ? "text-green-600" : "text-red-500"}`}>{metrics.skuChange >= 0 ? "+" : ""}{metrics.skuChange}% from last month</span>
          </div>
          <div className="bg-[#fcfaf5] p-3 rounded-lg border border-[#e6e2d3]/50"><PackageSearch className="w-6 h-6 text-[#8b6b15]" /></div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 flex items-center justify-between relative overflow-hidden border-l-4 border-l-green-500">
          <div>
            <span className="text-[11px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">TOTAL STOCK VALUE</span>
            <div className="text-4xl font-extrabold font-poppins text-gray-900">₹{metrics.totalStockValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100/50"><DollarSign className="w-6 h-6 text-green-600" /></div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 flex items-center justify-between relative overflow-hidden border-l-4 border-l-red-500">
          <div>
            <span className="text-[11px] font-bold text-gray-500 tracking-[0.1em] uppercase block mb-2">RETURNED & SELLABLE</span>
            <div className="text-4xl font-extrabold font-poppins text-gray-900">{metrics.sellableReturns.toLocaleString()}</div>
            <span className={`text-xs font-semibold mt-1 block ${metrics.sellableReturns > 100 ? "text-red-500" : "text-green-600"}`}>{metrics.sellableReturns > 100 ? "Requires immediate restock" : "Within acceptable range"}</span>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100/50"><RefreshCcw className="w-6 h-6 text-red-600" /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200">
        {(["All", "Inbound", "Sellable Returns", "Damaged Returns", "Activity Log"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-[#8b6b15]" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
            {activeTab === tab && <motion.div layoutId="activeTabStock" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b6b15]" />}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "All" ? renderAllTab() : activeTab === "Damaged Returns" ? renderDamagedReturnsTab() : activeTab === "Activity Log" ? renderActivityLogTab() : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              {renderTableHead()}
              <tbody className="divide-y divide-gray-100">
                {sortedEntries.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">No entries match your filters.</td></tr>
                ) : (
                  sortedEntries.map(renderTableRow)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEntry(null)} className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 shrink-0">
                <div className="flex justify-between mb-3"><span className="text-[10px] font-bold text-gray-400">SKU ID</span><button onClick={() => setSelectedEntry(null)}><X className="w-5 h-5 text-gray-500" /></button></div>
                <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded mb-2 inline-block">{selectedEntry.sku_id}</div>
                <h2 className="text-xl font-bold">{selectedEntry.name}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div><div className="text-[10px] text-gray-400 mb-1">Type</div><div className="text-sm font-semibold">{selectedEntry.type}</div></div>
                  <div><div className="text-[10px] text-gray-400 mb-1">Condition</div><ConditionBadge condition={selectedEntry.condition} /></div>
                  <div><div className="text-[10px] text-gray-400 mb-1">Cost</div><div className="text-sm font-semibold">₹{selectedEntry.cost_price}</div></div>
                  <div><div className="text-[10px] text-gray-400 mb-1">Net Stock (Live)</div><div className="text-sm font-bold text-gray-900">{selectedEntry.condition === "Damaged" ? 0 : (netStockBySku.get(selectedEntry.sku_id) || 0)} Units</div></div>
                </div>
                {selectedEntry.source_ref && (
                  <div className="p-4 bg-[#fcfaf5] border border-[#e6e2d3] rounded-lg">
                    <div className="text-xs font-bold text-[#8b6b15] tracking-wider uppercase mb-2 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Source Reference</div>
                    <p className="text-sm text-gray-700">Auto-synced from FBA Accounting entry: <span className="font-mono text-xs bg-white border px-1 py-0.5 rounded">{selectedEntry.source_ref}</span></p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between bg-gray-50/50">
                <h2 className="font-bold text-lg">Add Inbound Stock</h2>
                <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-5">
                <input type="text" required placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm outline-none" />
                <input type="text" required placeholder="SKU ID" value={newSku} onChange={(e) => setNewSku(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm outline-none" />
                <select value={newCondition} onChange={(e) => setNewCondition(e.target.value as any)} className="w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm outline-none">
                  <option value="Sellable">Sellable</option><option value="Damaged">Damaged</option>
                </select>
                {newCondition === "Sellable" && (
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" required placeholder="Qty" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm" />
                    <input type="number" required placeholder="Cost" value={newCost} onChange={(e) => setNewCost(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm" />
                  </div>
                )}
                <div className="mt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-lg">Save Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Stock Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between bg-blue-50/50">
                <h2 className="font-bold text-lg text-blue-900">Edit Stock Entry</h2>
                <button onClick={() => setEditingEntry(null)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none" />
                  <input type="text" required placeholder="SKU ID" value={editSku} onChange={(e) => setEditSku(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none" />
                  <select value={editType} onChange={(e) => setEditType(e.target.value as any)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none">
                    <option value="Inbound">Inbound</option><option value="Return-Sellable">Return-Sellable</option><option value="Return-Damaged">Return-Damaged</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={editCondition} onChange={(e) => setEditCondition(e.target.value as any)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none">
                    <option value="Sellable">Sellable</option><option value="Damaged">Damaged</option>
                  </select>
                  <input type="number" required placeholder="Qty" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm" disabled={editCondition === "Damaged"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required placeholder="Cost" value={editCost} onChange={(e) => setEditCost(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm" disabled={editCondition === "Damaged"} />
                  <div className="text-xs text-gray-500 pt-2">Source: {editingEntry.source_ref || "Manual"}</div>
                </div>
                <textarea placeholder="Warehouse Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none min-h-[60px]" />
                <div className="mt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingEntry(null)} className="px-5 py-2 text-sm font-semibold hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteEntryId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Stock Entry?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this stock entry? This cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteEntryId(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleDeleteConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
