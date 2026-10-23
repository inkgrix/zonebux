"use client";

import React, { useState, useMemo } from "react";
import { Transaction, TransactionType, AccountType } from "@/types/transaction";
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
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Wallet,
  Plus,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  accountFilter?: AccountType | "all";
}

export function TransactionList({
  transactions,
  isLoading,
  onOpenAddModal,
  accountFilter = "all",
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<"ALL" | TransactionType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatThaiDate = (dateStr: string) => {
    try {
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

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Account filter
      if (accountFilter !== "all" && t.account && t.account !== accountFilter) {
        return false;
      }

      // Type filter
      if (filterType !== "ALL" && t.type !== filterType) return false;

      // Month filter
      if (selectedMonth !== "ALL" && !t.date.startsWith(selectedMonth)) return false;

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
        if (!matchCategory && !matchNote && !matchAmount && !matchCost && !matchProfit && !matchAccount && !matchPayment) return false;
      }

      return true;
    });
  }, [transactions, accountFilter, filterType, selectedMonth, searchQuery]);

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

          {/* Segmented Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterType === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType("รายรับ")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterType === "รายรับ"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setFilterType("รายจ่าย")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterType === "รายจ่าย"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              รายจ่าย
            </button>
          </div>
        </div>

        {/* Search & Month Filter */}
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

          <div>
            <Select
              value={selectedMonth}
              onValueChange={(val) => {
                if (val) setSelectedMonth(val);
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-lg rounded-xl z-[100]">
                <SelectItem value="ALL" className="text-xs font-semibold py-2 cursor-pointer">
                  ทุกเดือน
                </SelectItem>
                {availableMonths.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs font-semibold py-2 cursor-pointer">
                    เดือน {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
          filteredTransactions.map((tx, idx) => {
            const isIncome = tx.type === "รายรับ";
            const isZonebux = !tx.account || tx.account === "ร้าน Zonebux";
            return (
              <div
                key={tx.id || idx}
                className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Type Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {isIncome ? (
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
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          isZonebux
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {tx.account || "ร้าน Zonebux"}
                      </span>
                      {tx.paymentMethod && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            tx.paymentMethod.includes("วอลเล็ท")
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {tx.paymentMethod.includes("วอลเล็ท") ? "📱 วอลเล็ท" : "🏦 ธนาคาร"}
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

                {/* Right: Amount & Diff Profit */}
                <div className="text-right flex-shrink-0 pl-3">
                  <div
                    className={`text-sm sm:text-base font-bold ${
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}฿{formatMoney(tx.amount)}
                  </div>

                  {/* Option 1: Cost & Diff Profit Display */}
                  {isIncome && tx.cost !== undefined && tx.cost > 0 && (() => {
                    const profitVal = tx.profit !== undefined ? tx.profit : tx.amount - tx.cost;
                    const isProfitable = profitVal >= 0;
                    return (
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px]">
                        <span className="text-slate-400 font-normal">
                          ทุน ฿{formatMoney(tx.cost)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`font-semibold px-1 py-0.2 rounded ${
                            isProfitable
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
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
