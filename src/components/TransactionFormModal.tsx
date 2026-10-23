"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Transaction,
  TransactionType,
  AccountType,
  PaymentMethod,
  ZONEBUX_INCOME_CATEGORIES,
  ZONEBUX_EXPENSE_CATEGORIES,
  GENERAL_INCOME_CATEGORIES,
  GENERAL_EXPENSE_CATEGORIES,
} from "@/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Tag, Store, Landmark, FileText, Edit3, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => Promise<boolean>;
  defaultAccount?: AccountType;
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultAccount = "ร้าน Zonebux",
}: TransactionFormModalProps) {
  const [account, setAccount] = useState<AccountType>(defaultAccount);
  const [type, setType] = useState<TransactionType>("รายรับ");
  const [amount, setAmount] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("บัญชีธนาคาร");
  const [date, setDate] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Dynamically compute categories according to selected account and type
  const availableCategories = useMemo(() => {
    if (account === "ร้าน Zonebux") {
      return type === "รายรับ"
        ? [...ZONEBUX_INCOME_CATEGORIES]
        : [...ZONEBUX_EXPENSE_CATEGORIES];
    } else {
      return type === "รายรับ"
        ? [...GENERAL_INCOME_CATEGORIES]
        : [...GENERAL_EXPENSE_CATEGORIES];
    }
  }, [account, type]);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split("T")[0]);
      setAccount(defaultAccount);
      setCost("");
      setPaymentMethod("บัญชีธนาคาร");
    }
  }, [isOpen, defaultAccount]);

  useEffect(() => {
    if (availableCategories.length > 0 && (!category || !(availableCategories as readonly string[]).includes(category))) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);

  const handleAccountChange = (newAccount: AccountType) => {
    setAccount(newAccount);
    const newCats =
      newAccount === "ร้าน Zonebux"
        ? type === "รายรับ"
          ? ZONEBUX_INCOME_CATEGORIES
          : ZONEBUX_EXPENSE_CATEGORIES
        : type === "รายรับ"
        ? GENERAL_INCOME_CATEGORIES
        : GENERAL_EXPENSE_CATEGORIES;
    setCategory(newCats[0]);
    setCustomCategory("");
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats =
      account === "ร้าน Zonebux"
        ? newType === "รายรับ"
          ? ZONEBUX_INCOME_CATEGORIES
          : ZONEBUX_EXPENSE_CATEGORIES
        : newType === "รายรับ"
        ? GENERAL_INCOME_CATEGORIES
        : GENERAL_EXPENSE_CATEGORIES;
    setCategory(newCats[0]);
    setCustomCategory("");
    if (newType === "รายจ่าย") {
      setCost("");
    }
  };

  const handleAddQuickAmount = (val: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  // Real-time Profit Calculation (Diff)
  const diffCalculation = useMemo(() => {
    const numAmount = parseFloat(amount);
    const numCost = parseFloat(cost);

    if (type !== "รายรับ" || isNaN(numAmount) || numAmount <= 0 || isNaN(numCost) || numCost < 0) {
      return null;
    }

    const profit = numAmount - numCost;
    const margin = (profit / numAmount) * 100;

    return {
      profit,
      margin,
      isProfit: profit > 0,
      isLoss: profit < 0,
      isEven: profit === 0,
    };
  }, [amount, cost, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("กรุณาระบุจำนวนเงินที่มากกว่า 0");
      return;
    }

    let finalCategory = category;
    if (category === "อื่นๆ (ระบุเอง)") {
      finalCategory = customCategory.trim() || "อื่นๆ";
    }

    if (!finalCategory) {
      setErrorMsg("กรุณาเลือกหรือระบุหมวดหมู่");
      return;
    }

    const parsedCost = cost ? parseFloat(cost) : undefined;

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        account,
        type,
        amount: parsedAmount,
        cost: parsedCost && !isNaN(parsedCost) ? parsedCost : undefined,
        profit: parsedCost !== undefined ? parsedAmount - parsedCost : undefined,
        category: finalCategory,
        paymentMethod: type === "รายรับ" ? paymentMethod : undefined,
        date: date || new Date().toISOString().split("T")[0],
        note: note.trim(),
      });

      if (success) {
        setAmount("");
        setCost("");
        setNote("");
        setPaymentMethod("บัญชีธนาคาร");
        setCustomCategory("");
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 bg-white border-slate-200 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              บันทึกรายการ
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            บันทึกรายรับหรือรายจ่าย ข้อมูลจะถูกส่งไปยัง Google Sheet ของคุณทันที
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกบัญชี / แหล่งที่มา *
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleAccountChange("ร้าน Zonebux")}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  account === "ร้าน Zonebux"
                    ? "bg-white text-sky-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="w-3.5 h-3.5 text-sky-600" />
                <span>ร้าน Zonebux</span>
              </button>
              <button
                type="button"
                onClick={() => handleAccountChange("บัญชีร้านทั่วไป")}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  account === "บัญชีร้านทั่วไป"
                    ? "bg-white text-indigo-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>บัญชีร้านทั่วไป</span>
              </button>
            </div>
          </div>

          {/* 2. Type Switch */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleTypeChange("รายรับ")}
              className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                type === "รายรับ"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              + รายรับ (ยอดขาย)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("รายจ่าย")}
              className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                type === "รายจ่าย"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              - รายจ่าย
            </button>
          </div>

          {/* 3. Amount & Cost Grid */}
          <div className={type === "รายรับ" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
            {/* Amount (ราคาขาย) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {type === "รายรับ" ? "ราคาขาย / ยอดที่ลูกค้าโอน (บาท) *" : "จำนวนเงิน (บาท) *"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  ฿
                </span>
                <Input
                  id="amount-input"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                  className="pl-10 h-12 text-2xl font-bold text-slate-900 bg-white"
                />
              </div>

              {/* Quick chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[50, 105, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddQuickAmount(val)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost (ต้นทุนสินค้า - เฉพาะรายรับ) */}
            {type === "รายรับ" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    ต้นทุนของออเดอร์นี้ (บาท)
                  </label>
                  <span className="text-[10px] text-slate-400">เว้นว่างได้ถ้าไม่มีทุน</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    ฿
                  </span>
                  <Input
                    id="cost-input"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="เช่น 86.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="pl-10 h-12 text-2xl font-bold text-slate-900 bg-white border-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  ระบบจะนำราคาขายไปลบต้นทุนเพื่อคำนวณกำไรให้อัตโนมัติ
                </p>
              </div>
            )}
          </div>

          {/* 🌟 Live Real-time Profit (Diff) Box */}
          {diffCalculation && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all animate-modalIn ${
                diffCalculation.isProfit
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : diffCalculation.isLoss
                  ? "bg-rose-50/80 border-rose-200 text-rose-900"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {diffCalculation.isProfit ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : diffCalculation.isLoss ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : null}
                <div>
                  <span className="text-xs font-semibold">
                    {diffCalculation.isProfit
                      ? "กำไรของออเดอร์นี้ (Diff Profit)"
                      : diffCalculation.isLoss
                      ? "ขาดทุนออเดอร์นี้"
                      : "เท่าทุน"}
                  </span>
                  <p className="text-[11px] opacity-80">
                    ขาย ฿{parseFloat(amount).toLocaleString()} - ทุน ฿{parseFloat(cost).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-extrabold tracking-tight ${
                    diffCalculation.isProfit
                      ? "text-emerald-600"
                      : diffCalculation.isLoss
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {diffCalculation.profit >= 0 ? "+" : ""}฿{diffCalculation.profit.toFixed(2)}
                </div>
                <span className="text-[10px] font-bold opacity-75">
                  ({diffCalculation.margin.toFixed(1)}% Margin)
                </span>
              </div>
            </div>
          )}

          {/* 4. Category Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                หมวดหมู่ *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                (หมวดหมู่สำหรับ {account})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium text-center truncate border transition cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 border-sky-400 text-sky-800 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* If 'อื่นๆ (ระบุเอง)' is selected */}
            {category === "อื่นๆ (ระบุเอง)" && (
              <div className="mt-2.5 space-y-1 animate-modalIn">
                <label className="text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-sky-600" />
                  <span>ระบุชื่อหมวดหมู่ที่ต้องการ:</span>
                </label>
                <Input
                  type="text"
                  placeholder="พิมพ์หมวดหมู่ เช่น ค่าโดเมน, คืนเงินค่าไอดี..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                  required
                  className="h-9 text-xs sm:text-sm bg-sky-50/40 border-sky-300 focus:border-sky-500"
                />
              </div>
            )}
          </div>

          {/* 5. Payment Method & Date */}
          <div className={type === "รายรับ" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
            {type === "รายรับ" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  ช่องทางรับเงิน (Payment Method) *
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => {
                    if (val) setPaymentMethod(val as PaymentMethod);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer">
                    <SelectValue placeholder="เลือกช่องทางรับเงิน" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg rounded-xl z-[100]">
                    <SelectItem value="บัญชีธนาคาร" className="text-xs font-semibold py-2 cursor-pointer">
                      🏦 บัญชีธนาคาร
                    </SelectItem>
                    <SelectItem value="ทรูมันนี่วอลเล็ท" className="text-xs font-semibold py-2 cursor-pointer">
                      📱 ทรูมันนี่วอลเล็ท (TrueMoney)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ทำรายการ *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="text-xs sm:text-sm h-9 bg-white"
              />
            </div>
          </div>

          {/* 6. Note Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              หมายเหตุ / บันทึกเพิ่มเติม (Note)
            </label>
            <Input
              type="text"
              placeholder="เช่น 300 Robux, ลูกค้าชื่อ..., เลขออเดอร์"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs sm:text-sm h-9 bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              id="submit-transaction-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-10 text-sm font-bold shadow-xs ${
                type === "รายรับ"
                  ? "bg-sky-600 hover:bg-sky-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <span>
                  บันทึก{type} {amount ? `฿${Number(amount).toLocaleString()}` : ""} 
                  {diffCalculation ? ` (กำไร +฿${diffCalculation.profit.toFixed(2)})` : ""}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
