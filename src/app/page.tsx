"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Transaction,
  isBinanceDepositTx,
  isBinanceExpenseTx,
} from "@/types/transaction";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, AccountView } from "@/components/AppSidebar";
import { StatsCards } from "@/components/StatsCards";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFormModal } from "@/components/TransactionFormModal";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  FileSpreadsheet,
  RotateCw,
  Store,
  Landmark,
  LayoutDashboard,
  Lock,
  Coins,
} from "lucide-react";
import { PinGate } from "@/components/PinGate";

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AccountView>("all");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "auth_required" | "error"
  >("loading");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ show: true, type, message });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
    },
    []
  );

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setStatus("loading");
    try {
      const res = await fetch("/api/transactions");
      const json = await res.json();

      if (json.status === "auth_required") {
        setStatus("auth_required");
        setStatusMessage(json.message);
        setTransactions([]);
        return;
      }

      if (json.status === "success" && Array.isArray(json.data)) {
        const sorted = [...json.data].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setTransactions(sorted);
        setStatus("success");
      } else {
        setStatus("error");
        setStatusMessage(json.message || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setStatus("error");
      setStatusMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    // Check remember me state in localStorage or sessionStorage
    const localUnlocked = localStorage.getItem("zonebux_pin_unlocked");
    const sessionUnlocked = sessionStorage.getItem("zonebux_pin_unlocked");

    if (localUnlocked) {
      const expiry = Number(localUnlocked);
      if (!isNaN(expiry) && expiry > Date.now()) {
        setIsUnlocked(true);
        fetchTransactions();
        return;
      } else {
        localStorage.removeItem("zonebux_pin_unlocked");
      }
    }

    if (sessionUnlocked === "true") {
      setIsUnlocked(true);
      fetchTransactions();
      return;
    }

    setIsUnlocked(false);
  }, [fetchTransactions]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    fetchTransactions();
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem("zonebux_pin_unlocked");
    sessionStorage.removeItem("zonebux_pin_unlocked");
    showToast("ล็อกหน้าจอเรียบร้อยแล้ว", "info");
  };

  const handleAddTransaction = async (
    newTx: Omit<Transaction, "id">
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      });

      const json = await res.json();

      if (json.status === "auth_required") {
        setStatus("auth_required");
        setStatusMessage(json.message);
        showToast(json.message, "error");
        return false;
      }

      if (res.ok && json.status === "success") {
        showToast(
          `บันทึก ${newTx.type} ฿${Number(newTx.amount).toLocaleString()} (${newTx.account || "ร้าน Zonebux"}) เรียบร้อยแล้ว`,
          "success"
        );

        const optimisticItem: Transaction = {
          id: json.data?.id || `temp-${Date.now()}`,
          ...newTx,
        };
        setTransactions((prev) => [optimisticItem, ...prev]);

        setTimeout(() => {
          fetchTransactions();
        }, 1500);

        return true;
      } else {
        showToast(json.message || "เกิดข้อผิดพลาดในการบันทึก", "error");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อได้";
      showToast(msg, "error");
      return false;
    }
  };

  const handleUpdateTransaction = async (
    updatedTx: Transaction
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTx),
      });

      const json = await res.json();

      if (json.status === "auth_required") {
        setStatus("auth_required");
        setStatusMessage(json.message);
        showToast(json.message, "error");
        return false;
      }

      if (res.ok && json.status === "success") {
        showToast(
          `แก้ไขรายการ ฿${Number(updatedTx.amount).toLocaleString()} เรียบร้อยแล้ว`,
          "success"
        );

        setTransactions((prev) =>
          prev.map((t) => (t.id === updatedTx.id ? { ...t, ...updatedTx } : t))
        );

        setTimeout(() => {
          fetchTransactions();
        }, 1500);

        return true;
      } else {
        showToast(json.message || "เกิดข้อผิดพลาดในการแก้ไขรายการ", "error");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อได้";
      showToast(msg, "error");
      return false;
    }
  };

  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.status === "auth_required") {
        setStatus("auth_required");
        setStatusMessage(json.message);
        showToast(json.message, "error");
        return false;
      }

      if (res.ok && json.status === "success") {
        showToast("ลบรายการออกจากระบบเรียบร้อยแล้ว", "success");

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        setTimeout(() => {
          fetchTransactions();
        }, 1500);

        return true;
      } else {
        showToast(json.message || "เกิดข้อผิดพลาดในการลบรายการ", "error");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อได้";
      showToast(msg, "error");
      return false;
    }
  };

  // Counts for sidebar badges
  const transactionsCount = useMemo(() => {
    const total = transactions.length;
    const zonebux = transactions.filter(
      (t) => !t.account || t.account === "ร้าน Zonebux"
    ).length;
    const general = transactions.filter(
      (t) => t.account === "บัญชีร้านทั่วไป"
    ).length;
    const binance = transactions.filter(
      (t) => isBinanceDepositTx(t) || isBinanceExpenseTx(t)
    ).length;
    return { total, zonebux, general, binance };
  }, [transactions]);

  // Filtered transactions for the current view
  const visibleTransactions = useMemo(() => {
    if (currentView === "zonebux") {
      return transactions.filter(
        (t) => !t.account || t.account === "ร้าน Zonebux"
      );
    }
    if (currentView === "general") {
      return transactions.filter((t) => t.account === "บัญชีร้านทั่วไป");
    }
    if (currentView === "binance") {
      return transactions.filter(
        (t) => isBinanceDepositTx(t) || isBinanceExpenseTx(t)
      );
    }
    return transactions;
  }, [transactions, currentView]);

  const currentViewTitle = useMemo(() => {
    if (currentView === "zonebux") return "ร้าน Zonebux";
    if (currentView === "general") return "บัญชีร้านทั่วไป";
    if (currentView === "binance") return "กระเป๋า Binance (USDT)";
    return "ภาพรวมบัญชีทั้งหมด";
  }, [currentView]);

  const currentViewSubtitle = useMemo(() => {
    if (currentView === "zonebux") {
      return "แสดงเฉพาะยอดขาย ต้นทุน และรายรับรายจ่ายของร้าน Zonebux";
    }
    if (currentView === "general") {
      return "แสดงเฉพาะเงินหมุนเวียน เงินโอนเข้า-ออก และค่าใช้จ่ายทั่วไป";
    }
    if (currentView === "binance") {
      return "แสดงยอดเงินคงเหลือ การเติมเหรียญ และประวัติการจ่ายสต็อกผ่าน Binance";
    }
    return "แสดงข้อมูลรวมทั้งร้าน Zonebux และบัญชีร้านทั่วไป";
  }, [currentView]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">กำลังเตรียมระบบ ZoneBux...</span>
        </div>
      </div>
    );
  }

  // 🔒 Security PIN Gate Guard
  if (!isUnlocked) {
    return <PinGate onUnlock={handleUnlock} />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-16 right-4 z-50">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-semibold bg-white animate-modalIn ${toast.type === "success"
              ? "border-emerald-200 text-emerald-800"
              : toast.type === "error"
                ? "border-rose-200 text-rose-800"
                : "border-slate-200 text-slate-800"
              }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Official shadcn Sidebar */}
      <AppSidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        onRefresh={fetchTransactions}
        isLoading={isLoading}
        transactionsCount={transactionsCount}
        onLock={handleLock}
      />

      {/* Main App Inset */}
      <SidebarInset className="bg-slate-50 min-h-screen flex flex-col">
        {/* Top Header Bar inside Inset */}
        <header className="sticky top-0 z-20 flex h-15 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 xl:px-10 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              {currentView === "all" && (
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
              )}
              {currentView === "zonebux" && (
                <Store className="w-4 h-4 text-sky-600" />
              )}
              {currentView === "general" && (
                <Landmark className="w-4 h-4 text-indigo-600" />
              )}
              {currentView === "binance" && (
                <Coins className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-sm font-bold text-slate-900">
                {currentViewTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center text-xs mr-1">
              {status === "loading" && (
                <span className="flex items-center gap-1.5 text-sky-600 font-medium">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  กำลังซิงค์...
                </span>
              )}
              {status === "success" && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ซิงค์แล้ว
                </span>
              )}
              {status === "auth_required" && (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium" title={statusMessage}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  รอตั้งสิทธิ์
                </span>
              )}
              {status === "error" && (
                <span className="flex items-center gap-1.5 text-rose-600 font-medium" title={statusMessage}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  การเชื่อมต่อขัดข้อง
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              id="header-refresh-btn"
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              disabled={isLoading}
              title="ดึงข้อมูลล่าสุดจาก Google Sheet"
              className="gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>

            {/* Lock Screen Button */}
            <Button
              id="header-lock-btn"
              variant="outline"
              size="sm"
              onClick={handleLock}
              title="ล็อกหน้าจอ เพื่อความเป็นส่วนตัว"
              className="gap-1.5 text-slate-600 hover:text-slate-900"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ล็อกหน้าจอ</span>
            </Button>

            {/* Add Transaction Button */}
            <Button
              id="header-add-btn"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="gap-1.5 font-semibold"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>บันทึกรายการ</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6">
          {/* Banner if Google Sheet requires permissions update */}
          {status === "auth_required" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                    ต้องปรับสิทธิ์การเข้าถึง Google Sheet ใน Apps Script
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    ไปที่แท็บ Google Sheet &gt; ส่วนขยาย &gt; Apps Script &gt; กด{" "}
                    <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; จัดการการทำให้ใช้งานได้ &gt;
                    เปลี่ยน <strong>&quot;ผู้มีสิทธิ์เข้าถึง (Who has access)&quot;</strong> ให้เป็น{" "}
                    <strong>&quot;ทุกคน (Anyone)&quot;</strong>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchTransactions}
                className="border-amber-300 text-amber-900 hover:bg-amber-100 flex-shrink-0"
              >
                ลองเชื่อมต่อใหม่
              </Button>
            </div>
          )}

          {/* Page Title & View Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {currentViewTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentViewSubtitle}
              </p>
            </div>
          </div>

          {/* Analytics Cards (Filtered by current account view) */}
          <StatsCards
            transactions={visibleTransactions}
            allTransactions={transactions}
            isLoading={isLoading}
            currentView={currentView}
          />

          {/* 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Column: Transaction Feed */}
            <div className="lg:col-span-2">
              <TransactionList
                transactions={visibleTransactions}
                isLoading={isLoading}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                onEditTransaction={(tx) => {
                  setEditingTransaction(tx);
                  setIsModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                accountFilter={
                  currentView === "all" || currentView === "binance"
                    ? "all"
                    : currentView === "zonebux"
                    ? "ร้าน Zonebux"
                    : "บัญชีร้านทั่วไป"
                }
              />
            </div>

            {/* Remind กลับมาเปิดได้ */}
            <div className="space-y-4">
              {/* Quick Add CTA Card */}
              {/* <Card className="p-5 border-sky-100 bg-sky-50/50 shadow-xs rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">บันทึกรายการใหม่</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  บันทึกรายรับหรือรายจ่ายสำหรับ {currentView === "general" ? "บัญชีร้านทั่วไป" : "ร้าน Zonebux"} ข้อมูลจะถูกบันทึกเข้า Google Sheet ทันที
                </p>
                <div className="pt-1">
                  <Button
                    id="sidebar-add-btn"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full gap-1.5 font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>เปิดฟอร์มบันทึก</span>
                  </Button>
                </div>
              </Card> */}

              <CategoryBreakdown transactions={visibleTransactions} />
              <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheets Database</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ข้อมูลทุกรายการถูกจัดเก็บบน Google Sheet สามารถเปิดดูและส่งออกเป็น Excel ได้ทุกเวลา
                </p>
                <div className="pt-0.5">
                  <a
                    href="https://sheets.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                  >
                    <span>เปิดสเปรดชีตของคุณ</span>
                    <span>→</span>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 ZoneBux • ระบบบัญชีร้านค้า</p>
            <p className="text-slate-400">Made with passion by inkgrix</p>
          </div>
        </footer>
      </SidebarInset>

      {/* Modal Dialog */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        initialData={editingTransaction}
        defaultAccount={currentView === "general" ? "บัญชีร้านทั่วไป" : "ร้าน Zonebux"}
      />
    </SidebarProvider>
  );
}
