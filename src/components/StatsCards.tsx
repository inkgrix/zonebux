import React from "react";
import { Transaction } from "@/types/transaction";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { AccountView } from "./AppSidebar";

interface StatsCardsProps {
  transactions: Transaction[];
  isLoading: boolean;
  currentView?: AccountView;
}

export function StatsCards({
  transactions,
  isLoading,
  currentView = "all",
}: StatsCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "รายรับ")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "รายจ่าย")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Only consider transactions where a real cost was specified and > 0
  const salesWithCost = transactions.filter(
    (t) =>
      t.type === "รายรับ" &&
      t.category !== "เงินทุนหมุนเวียน" &&
      t.category !== "เงินโอนสลับบัญชี" &&
      t.account !== "บัญชีร้านทั่วไป" &&
      t.cost !== undefined &&
      t.cost > 0
  );

  const totalCost = salesWithCost.reduce(
    (sum, t) => sum + (Number(t.cost) || 0),
    0
  );

  const totalProfit = salesWithCost.reduce(
    (sum, t) => sum + (Number(t.profit ?? (t.amount - (t.cost || 0))) || 0),
    0
  );

  // In "general" account, never show sales profit because it is capital/petty expense
  const hasCostData =
    currentView !== "general" && (totalCost > 0 || totalProfit > 0);

  const netBalance = totalIncome - totalExpense;

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const totalSalesRevenue = salesWithCost.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );
  const salesMargin =
    totalSalesRevenue > 0 && totalProfit > 0
      ? (totalProfit / totalSalesRevenue) * 100
      : 0;

  // Dynamic titles depending on account view
  const balanceTitle =
    currentView === "general"
      ? "ยอดคงเหลือในบัญชี (Net Balance)"
      : currentView === "zonebux"
      ? "ยอดเงินในบัญชีรับโอน (Cash in Bank)"
      : "ยอดคงเหลือสุทธิ (Total Balance)";

  const balanceSubtitle =
    currentView === "general"
      ? "เงินสดคงเหลือในบัญชีหมุนเวียน"
      : currentView === "zonebux"
      ? "เงินสดสะสมในบัญชีรับเงิน (ตรงกับแอปธนาคาร)"
      : netBalance >= 0
      ? "สถานะการเงินรวมเป็นบวก"
      : "รายจ่ายมากกว่ารายรับ";

  const incomeTitle =
    currentView === "general"
      ? "เงินรับเข้า / ทุนหมุนเวียน (Inflow)"
      : currentView === "zonebux"
      ? "ยอดขายรวม (Gross Sales)"
      : "รายรับทั้งหมด (Total Income)";

  const incomeSubtitle =
    currentView === "zonebux"
      ? `${transactions.filter((t) => t.type === "รายรับ").length} รายการรับ ${
          totalCost > 0
            ? `• ทุนรวม ฿${formatMoney(totalCost)} (รอโอนคืนสิ้นเดือน)`
            : ""
        }`
      : currentView === "general"
      ? `${transactions.filter((t) => t.type === "รายรับ").length} รายการรับเข้า`
      : `${transactions.filter((t) => t.type === "รายรับ").length} รายการรับทั้งหมด`;

  const profitTitle =
    currentView === "zonebux"
      ? "กำไรสุทธิรอโอนเงินเดือน (Net Profit)"
      : "กำไรสุทธิจากยอดขาย (Net Profit)";

  const profitSubtitle =
    currentView === "zonebux"
      ? `กำไรเฉลี่ย ${salesMargin.toFixed(1)}% • โอนเป็นเงินเดือนได้ตอนสิ้นเดือน`
      : `กำไรเฉลี่ย ${salesMargin.toFixed(1)}% ของยอดขายที่มีต้นทุน`;

  const expenseTitle =
    currentView === "general"
      ? "ค่าใช้จ่ายทั้งหมด (Expense)"
      : currentView === "zonebux"
      ? "รายจ่ายร้านค้า (Store Expense)"
      : "รายจ่ายทั้งหมด (Expense)";

  const expenseSubtitle =
    currentView === "zonebux"
      ? `${
          transactions.filter((t) => t.type === "รายจ่าย").length
        } รายการจ่าย (เฉพาะค่าบอท/คืนเงิน)`
      : `${transactions.filter((t) => t.type === "รายจ่าย").length} รายการจ่าย`;

  return (
    <div
      className={`grid grid-cols-1 ${
        hasCostData ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"
      } gap-4`}
    >
      {/* 1. ยอดเงินสดในบัญชี (Net Balance / Cash in Bank) */}
      <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {balanceTitle}
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              netBalance >= 0 ? "text-slate-900" : "text-rose-600"
            }`}
          >
            {isLoading ? "..." : `฿${formatMoney(netBalance)}`}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {balanceSubtitle}
          </p>
        </div>
      </Card>

      {/* 2. รายรับ / ยอดขาย */}
      <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {incomeTitle}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600">
            {isLoading ? "..." : `+฿${formatMoney(totalIncome)}`}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {incomeSubtitle}
          </p>
        </div>
      </Card>

      {/* 3. กำไรสุทธิรอโอนเงินเดือน (Net Profit) */}
      {hasCostData && (
        <Card className="p-5 border-emerald-100 bg-emerald-50/40 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">
              {profitTitle}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700">
              {isLoading ? "..." : `+฿${formatMoney(totalProfit)}`}
            </div>
            <p className="text-xs text-emerald-800/80 mt-1 font-semibold">
              {profitSubtitle}
            </p>
          </div>
        </Card>
      )}

      {/* 4. รายจ่ายร้านค้า (Expense) */}
      <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {expenseTitle}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600">
            {isLoading ? "..." : `-฿${formatMoney(totalExpense)}`}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {expenseSubtitle}
          </p>
        </div>
      </Card>
    </div>
  );
}
