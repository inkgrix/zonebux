"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Transaction,
  TransactionType,
  AccountType,
  isBinanceDepositTx,
  isBinanceCostTx,
} from "@/types/transaction";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  Wallet,
  Plus,
  RotateCcw,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Download,
  Coins,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  accountFilter?: AccountType | "all";
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => Promise<boolean>;
}

function formatToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 10);
  }
  if (/^\d{4}\/\d{2}\/\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 10).replace(/\//g, "-");
  }
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return formatToLocalDateString(d);
  }
  return trimmed;
}

const DATE_FILTER_LABELS: Record<string, string> = {
  all: "ทั้งหมด",
  today: "วันนี้",
  yesterday: "เมื่อวาน",
  "7days": "7 วันที่แล้ว",
  thisMonth: "เดือนนี้",
  lastMonth: "เดือนที่แล้ว",
  custom: "กำหนดเอง",
};

export function TransactionList({
  transactions,
  isLoading,
  onOpenAddModal,
  accountFilter = "all",
  onEditTransaction,
  onDeleteTransaction,
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<"ALL" | TransactionType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // 📄 Pagination State (Default 10 items)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id || !onDeleteTransaction) return;
    setIsDeleting(true);
    try {
      const ok = await onDeleteTransaction(deleteTarget.id);
      if (ok) {
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const cleanDate = parseDateOnly(dateStr);
      const parts = cleanDate.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatThaiMonth = (yearMonthStr: string) => {
    try {
      const [year, month] = yearMonthStr.split("-");
      if (year && month) {
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        return d.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
        });
      }
      return yearMonthStr;
    } catch {
      return yearMonthStr;
    }
  };

  const todayStr = useMemo(() => formatToLocalDateString(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatToLocalDateString(d);
  }, []);
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatToLocalDateString(d);
  }, []);
  const thisMonthStr = useMemo(() => todayStr.substring(0, 7), [todayStr]);
  const lastMonthStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return formatToLocalDateString(d).substring(0, 7);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Account filter
      if (accountFilter !== "all" && t.account && t.account !== accountFilter) {
        return false;
      }

      // Type filter
      if (filterType !== "ALL" && t.type !== filterType) return false;

      // Date filter
      const txDate = parseDateOnly(t.date);

      if (dateFilter === "today") {
        if (txDate !== todayStr) return false;
      } else if (dateFilter === "yesterday") {
        if (txDate !== yesterdayStr) return false;
      } else if (dateFilter === "7days") {
        if (txDate < sevenDaysAgoStr || txDate > todayStr) return false;
      } else if (dateFilter === "thisMonth") {
        if (!txDate.startsWith(thisMonthStr)) return false;
      } else if (dateFilter === "lastMonth") {
        if (!txDate.startsWith(lastMonthStr)) return false;
      } else if (dateFilter === "custom") {
        if (customStartDate && txDate < customStartDate) return false;
        if (customEndDate && txDate > customEndDate) return false;
      }
      // "all" passes through

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCategory = (t.category || "").toLowerCase().includes(q);
        const matchNote = (t.note || "").toLowerCase().includes(q);
        const matchAmount = String(t.amount || "").includes(q);
        const matchCost = t.cost !== undefined && String(t.cost).includes(q);
        const matchProfit = t.profit !== undefined && String(t.profit).includes(q);
        const matchAccount = (t.account || "").toLowerCase().includes(q);
        const matchPayment = (t.paymentMethod || "").toLowerCase().includes(q);
        if (
          !matchCategory &&
          !matchNote &&
          !matchAmount &&
          !matchCost &&
          !matchProfit &&
          !matchAccount &&
          !matchPayment
        )
          return false;
      }

      return true;
    });
  }, [
    transactions,
    accountFilter,
    filterType,
    dateFilter,
    todayStr,
    yesterdayStr,
    sevenDaysAgoStr,
    thisMonthStr,
    lastMonthStr,
    customStartDate,
    customEndDate,
    searchQuery,
  ]);

  // Quick summary for filtered results
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "รายรับ") income += amt;
      else if (t.type === "รายจ่าย") expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  // Reset page when any filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, dateFilter, searchQuery, customStartDate, customEndDate, accountFilter, pageSize]);

  // Pagination Computations
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTransactions.length);
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, startIndex, endIndex]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    if (safeCurrentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis-end", totalPages);
    } else if (safeCurrentPage >= totalPages - 2) {
      pages.push(1, "ellipsis-start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis-start", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "ellipsis-end", totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  // Export to CSV Function
  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "รหัสรายการ (ID)",
      "วันที่ (Date)",
      "ประเภท (Type)",
      "หมวดหมู่ (Category)",
      "บัญชี (Account)",
      "ยอดเงิน/ราคาขาย (Amount)",
      "ต้นทุน (Cost)",
      "กำไร (Profit)",
      "ช่องทางชำระเงิน (PaymentMethod)",
      "หมายเหตุ (Note)",
    ];

    const rows = filteredTransactions.map((tx) => {
      const escapeCell = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const amount = Number(tx.amount) || 0;
      const cost = tx.cost !== undefined ? Number(tx.cost) : "";
      const profit =
        tx.profit !== undefined
          ? Number(tx.profit)
          : tx.cost !== undefined
            ? amount - Number(tx.cost)
            : "";

      return [
        escapeCell(tx.id || ""),
        escapeCell(tx.date || ""),
        escapeCell(tx.type || ""),
        escapeCell(tx.category || ""),
        escapeCell(tx.account || "ร้าน Zonebux"),
        escapeCell(amount),
        escapeCell(cost),
        escapeCell(profit),
        escapeCell(tx.paymentMethod || ""),
        escapeCell(tx.note || ""),
      ].join(",");
    });

    // Prepend UTF-8 BOM (\uFEFF) for proper Thai characters in Excel
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const nowStr = formatToLocalDateString(new Date());
    link.setAttribute("download", `zonebux_transactions_${dateFilter}_${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setDateFilter("all");
    setFilterType("ALL");
    setSearchQuery("");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  const isFiltered =
    dateFilter !== "all" ||
    searchQuery.trim() !== "" ||
    filterType !== "ALL" ||
    customStartDate !== "" ||
    customEndDate !== "";

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs rounded-2xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 pb-4 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>ประวัติรายการ</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredTransactions.length} รายการ (จากทั้งหมด {transactions.length})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Export CSV button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredTransactions.length === 0}
              className="h-8 gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer shadow-2xs"
              title="ส่งออกรายการที่เลือกเป็นไฟล์ CSV (เปิดใน Excel ได้ภาษาไทยไม่เพี้ยน)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก CSV</span>
            </Button>

            {/* Segmented Filter: ทั้งหมด / รายรับ / รายจ่าย */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${filterType === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType("รายรับ")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${filterType === "รายรับ"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                รายรับ
              </button>
              <button
                onClick={() => setFilterType("รายจ่าย")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${filterType === "รายจ่าย"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                รายจ่าย
              </button>
            </div>
          </div>
        </div>

        {/* Search & Date Filter Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="ค้นหาหมวดหมู่, บัญชี, หมายเหตุ หรือจำนวนเงิน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-white"
            />
          </div>

          {/* Date Filter Dropdown using shadcn Select */}
          <div>
            <Select
              value={dateFilter}
              onValueChange={(val) => {
                if (val) {
                  setDateFilter(val);
                  if (val === "custom" && !customStartDate && !customEndDate) {
                    setCustomStartDate(sevenDaysAgoStr);
                    setCustomEndDate(todayStr);
                  }
                }
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer">
                <div className="flex items-center gap-1.5 truncate">
                  <CalendarDays className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <SelectValue placeholder="เลือกช่วงเวลา">
                    {DATE_FILTER_LABELS[dateFilter] || "เลือกช่วงเวลา"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl z-[100] min-w-[170px]">
                <SelectItem value="all" className="text-xs font-semibold py-2 cursor-pointer">
                  ทั้งหมด
                </SelectItem>
                <SelectItem value="today" className="text-xs font-semibold py-2 cursor-pointer">
                  วันนี้
                </SelectItem>
                <SelectItem value="yesterday" className="text-xs font-semibold py-2 cursor-pointer">
                  เมื่อวาน
                </SelectItem>
                <SelectItem value="7days" className="text-xs font-semibold py-2 cursor-pointer">
                  7 วันที่แล้ว
                </SelectItem>
                <SelectItem value="thisMonth" className="text-xs font-semibold py-2 cursor-pointer">
                  เดือนนี้
                </SelectItem>
                <SelectItem value="lastMonth" className="text-xs font-semibold py-2 cursor-pointer">
                  เดือนที่แล้ว
                </SelectItem>
                <SelectItem value="custom" className="text-xs font-semibold py-2 cursor-pointer">
                  กำหนดเอง
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range Picker (Expands when "กำหนดเอง" is selected) */}
        {dateFilter === "custom" && (
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2.5 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-sky-600" />
                กำหนดช่วงวันที่ต้องการดู
              </span>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-700 font-medium cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  ล้างวันที่
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ตั้งแต่วันที่
                </label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-8.5 text-xs bg-white border-slate-200 rounded-lg shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ถึงวันที่
                </label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-8.5 text-xs bg-white border-slate-200 rounded-lg shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Indicators & Quick Reset */}
        {isFiltered && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400">กรอง:</span>
              {dateFilter === "today" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  วันนี้ ({formatThaiDate(todayStr)})
                </span>
              )}
              {dateFilter === "yesterday" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  เมื่อวาน ({formatThaiDate(yesterdayStr)})
                </span>
              )}
              {dateFilter === "7days" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  7 วันที่แล้ว ({formatThaiDate(sevenDaysAgoStr)} - {formatThaiDate(todayStr)})
                </span>
              )}
              {dateFilter === "thisMonth" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  เดือนนี้ ({formatThaiMonth(thisMonthStr)})
                </span>
              )}
              {dateFilter === "lastMonth" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  เดือนที่แล้ว ({formatThaiMonth(lastMonthStr)})
                </span>
              )}
              {dateFilter === "custom" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                  {customStartDate || customEndDate
                    ? `${customStartDate ? formatThaiDate(customStartDate) : "เริ่มต้น"} ถึง ${customEndDate ? formatThaiDate(customEndDate) : "ปัจจุบัน"}`
                    : "กำหนดเอง"}
                </span>
              )}

              {/* Quick totals in current filter */}
              <span className="text-[11px] text-slate-500 font-medium pl-1">
                (รับ: <span className="text-emerald-600 font-bold">+฿{formatMoney(filteredSummary.income)}</span>, จ่าย: <span className="text-rose-600 font-bold">-฿{formatMoney(filteredSummary.expense)}</span>)
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100">
        {isLoading && transactions.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">กำลังโหลดข้อมูลจาก Google Sheet...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-800">ยังไม่มีรายการ</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                กดบันทึกรายการเพื่อส่งข้อมูลไปยัง Google Sheet ของคุณ
              </p>
            </div>
            <div className="pt-1.5">
              <Button
                size="sm"
                onClick={onOpenAddModal}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                เพิ่มรายการแรก
              </Button>
            </div>
          </div>
        ) : (
          paginatedTransactions.map((tx, idx) => {
            const isIncome = tx.type === "รายรับ";
            const isZonebux = !tx.account || tx.account === "ร้าน Zonebux";
            const isDeposit = isBinanceDepositTx(tx);
            return (
              <div
                key={tx.id || idx}
                className="group p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Type Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      isDeposit
                        ? "bg-amber-100/80 text-amber-600"
                        : isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {isDeposit ? (
                      <Coins className="w-4.5 h-4.5" />
                    ) : isIncome ? (
                      <ArrowDownLeft className="w-4.5 h-4.5 stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {tx.category || "ไม่มีหมวดหมู่"}
                      </span>
                      {isDeposit ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border bg-amber-100 text-amber-900 border-amber-300">
                          โยกเข้า Binance
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {tx.type}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${isZonebux
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                      >
                        {tx.account || "ร้าน Zonebux"}
                      </span>
                      {tx.paymentMethod && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            tx.paymentMethod.toLowerCase().includes("binance") ||
                            tx.paymentMethod.toLowerCase().includes("usdt")
                              ? "bg-amber-500/10 text-amber-800 border-amber-300/80 font-bold"
                              : tx.paymentMethod.includes("วอลเล็ท")
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {tx.paymentMethod.toLowerCase().includes("binance") ||
                          tx.paymentMethod.toLowerCase().includes("usdt")
                            ? "Binance"
                            : tx.paymentMethod.includes("วอลเล็ท")
                            ? "วอลเล็ท"
                            : "ธนาคาร"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatThaiDate(tx.date)}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-xs">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Diff Profit & Actions */}
                <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 pl-3">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        isDeposit
                          ? "text-amber-700 font-extrabold"
                          : isIncome
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {isDeposit ? "→" : isIncome ? "+" : "-"}฿{formatMoney(tx.amount)}
                    </div>
                    {isDeposit && (
                      <div className="text-[10px] font-medium text-amber-600 mt-0.5">
                        เข้ากระเป๋า Binance
                      </div>
                    )}

                    {/* Option 1: Cost & Diff Profit Display */}
                    {isIncome && tx.cost !== undefined && tx.cost > 0 && (() => {
                      const profitVal = tx.profit !== undefined ? tx.profit : tx.amount - tx.cost;
                      const isProfitable = profitVal >= 0;
                      const isCostFromBinance = isBinanceCostTx(tx);
                      return (
                        <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px] flex-wrap">
                          <span className="text-slate-400 font-normal flex items-center gap-1">
                            ทุน ฿{formatMoney(tx.cost)}
                            {isCostFromBinance && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300/80 px-1 py-0.2 rounded">
                                หัก Binance
                              </span>
                            )}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`font-semibold px-1 py-0.2 rounded ${isProfitable
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-rose-600 bg-rose-50"
                              }`}
                          >
                            กำไร {isProfitable ? "+" : ""}฿{formatMoney(profitVal)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions: Edit & Delete buttons */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {onEditTransaction && (
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 flex items-center justify-center transition cursor-pointer"
                        title="แก้ไขรายการนี้"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tx)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 📄 Shadcn Pagination Controls */}
      {filteredTransactions.length > 0 && (
        <div className="p-3.5 sm:px-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Range text & Page size select */}
          <div className="flex items-center gap-2.5 text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-[11px] sm:text-xs">
              แสดง <strong className="text-slate-800 font-bold">{filteredTransactions.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> จากทั้งหมด <strong className="text-slate-800 font-bold">{filteredTransactions.length}</strong> รายการ
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-400 hidden xs:inline">หน้าละ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right: Shadcn Pagination navigation */}
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-center sm:justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                  />
                </PaginationItem>

                {pageNumbers.map((pageItem, idx) => {
                  if (pageItem === "ellipsis-start" || pageItem === "ellipsis-end") {
                    return (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  const pageNum = pageItem as number;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === safeCurrentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-white border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                ยืนยันการลบรายการ
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              คุณต้องการลบรายการนี้ออกจากระบบและ Google Sheet ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-800">{deleteTarget.category}</span>
                <span
                  className={
                    deleteTarget.type === "รายรับ"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }
                >
                  {deleteTarget.type === "รายรับ" ? "+" : "-"}฿{formatMoney(deleteTarget.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span>{formatThaiDate(deleteTarget.date)}</span>
                <span>•</span>
                <span>{deleteTarget.account || "ร้าน Zonebux"}</span>
                {deleteTarget.paymentMethod && (
                  <>
                    <span>•</span>
                    <span>{deleteTarget.paymentMethod}</span>
                  </>
                )}
                {deleteTarget.note && (
                  <>
                    <span>•</span>
                    <span className="text-slate-600 truncate max-w-[200px]">
                      {deleteTarget.note}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
              className="text-xs font-semibold"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังลบข้อมูล...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ยืนยันลบรายการ</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
