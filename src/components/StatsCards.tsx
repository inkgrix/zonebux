import React from "react";
import {
  Transaction,
  isBinanceDepositTx,
  isBinanceExpenseTx,
  isBinanceCostTx,
} from "@/types/transaction";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Smartphone,
  Coins,
} from "lucide-react";
import { AccountView } from "./AppSidebar";

interface StatsCardsProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  isLoading: boolean;
  currentView?: AccountView;
}

export function StatsCards({
  transactions,
  allTransactions,
  isLoading,
  currentView = "all",
}: StatsCardsProps) {
  // คำนวณเงินในกระเป๋า Binance (ใช้รายการทั้งหมด เพื่อให้ยอดคงเหลือ Binance แสดงตรงกันทุกมุมมอง)
  const binanceSource = allTransactions || transactions;
  const binanceDeposits = binanceSource
    .filter(isBinanceDepositTx)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const binanceDepositsCount = binanceSource.filter(isBinanceDepositTx).length;

  // รวมทั้งรายจ่ายตรงผ่าน Binance และต้นทุนออเดอร์ที่จ่ายด้วย Binance
  const binanceDirectSpent = binanceSource
    .filter(isBinanceExpenseTx)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const binanceCostSpent = binanceSource
    .filter(isBinanceCostTx)
    .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  const binanceSpent = binanceDirectSpent + binanceCostSpent;

  const binanceSpentCount =
    binanceSource.filter(isBinanceExpenseTx).length +
    binanceSource.filter(isBinanceCostTx).length;

  const binanceBalance = binanceDeposits - binanceSpent;
  const approxUsdt =
    binanceBalance > 0 ? (binanceBalance / 35.5).toFixed(2) : "0.00";

  const totalIncome = transactions
    .filter((t) => t.type === "รายรับ")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // totalExpense: ห้ามนำเงินเติม/โยกเข้า Binance มาคิดเป็นรายจ่ายร้าน (เพราะเงินยังอยู่ แค่ย้ายกระเป๋า)
  const totalExpense = transactions
    .filter((t) => t.type === "รายจ่าย" && !isBinanceDepositTx(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // คำนวณแยกช่องทาง ธนาคาร vs ทรูมันนี่วอลเล็ท vs Binance
  const isBinanceTx = (pm?: string) =>
    Boolean(
      pm &&
        (pm.toLowerCase().includes("binance") || pm.toLowerCase().includes("usdt"))
    );
  const isWalletTx = (pm?: string) => Boolean(pm && pm.includes("วอลเล็ท"));
  const isBankTx = (pm?: string) =>
    !isBinanceTx(pm) && (!pm || pm.includes("ธนาคาร") || !isWalletTx(pm));

  const bankIncome = transactions
    .filter((t) => t.type === "รายรับ" && isBankTx(t.paymentMethod))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const bankIncomeCount = transactions.filter(
    (t) => t.type === "รายรับ" && isBankTx(t.paymentMethod)
  ).length;

  const walletIncome = transactions
    .filter((t) => t.type === "รายรับ" && isWalletTx(t.paymentMethod))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const walletIncomeCount = transactions.filter(
    (t) => t.type === "รายรับ" && isWalletTx(t.paymentMethod)
  ).length;

  const binanceIncome = transactions
    .filter((t) => t.type === "รายรับ" && isBinanceTx(t.paymentMethod))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const binanceIncomeCount = transactions.filter(
    (t) => t.type === "รายรับ" && isBinanceTx(t.paymentMethod)
  ).length;

  const binanceExpense = transactions
    .filter((t) => t.type === "รายจ่าย" && isBinanceTx(t.paymentMethod))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const binanceExpenseCount = transactions.filter(
    (t) => t.type === "รายจ่าย" && isBinanceTx(t.paymentMethod)
  ).length;

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
      : `${transactions.filter((t) => t.type === "รายรับ").length} รายการ (ธนาคาร ฿${formatMoney(bankIncome)} • วอเลต ฿${formatMoney(walletIncome)}${
          binanceIncome > 0 ? ` • Binance ฿${formatMoney(binanceIncome)}` : ""
        })`;

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
      ? `${transactions.filter((t) => t.type === "รายจ่าย").length} รายการจ่าย${
          binanceExpense > 0
            ? ` (Binance ฿${formatMoney(binanceExpense)})`
            : " (เฉพาะค่าบอท/คืนเงิน)"
        }`
      : `${transactions.filter((t) => t.type === "รายจ่าย").length} รายการจ่าย${
          binanceExpense > 0
            ? ` (Binance ฿${formatMoney(binanceExpense)})`
            : ""
        }`;

  // มุมมองเฉพาะ "กระเป๋า Binance"
  if (currentView === "binance") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ยอดคงเหลือใน Binance */}
        <Card className="p-5 border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">
              ยอดคงเหลือใน Binance (USDT)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-900">
              {isLoading ? "..." : `฿${formatMoney(binanceBalance)}`}
            </div>
            <p className="text-xs text-amber-700/90 mt-1 font-semibold">
              ≈ ${approxUsdt} USDT (พร้อมใช้ซื้อสต็อก)
            </p>
          </div>
        </Card>

        {/* 2. ยอดเติมเหรียญสะสม */}
        <Card className="p-5 border-emerald-100 bg-emerald-50/40 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">
              ยอดเติมเหรียญสะสม (Inflow)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700">
              {isLoading ? "..." : `+฿${formatMoney(binanceDeposits)}`}
            </div>
            <p className="text-xs text-emerald-800/80 mt-1 font-semibold">
              {binanceDepositsCount} รายการโยกเงินเข้ากระเป๋า
            </p>
          </div>
        </Card>

        {/* 3. ยอดจ่ายสต็อก/บอทสะสม */}
        <Card className="p-5 border-rose-100 bg-rose-50/40 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900">
              ยอดจ่ายผ่าน Binance (Outflow)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600">
              {isLoading ? "..." : `-฿${formatMoney(binanceSpent)}`}
            </div>
            <p className="text-xs text-rose-800/80 mt-1 font-semibold">
              {binanceSpentCount} รายการจ่ายสต็อกและค่าบริการ
            </p>
          </div>
        </Card>

        {/* 4. เรทอ้างอิง */}
        <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              เรทแปลงสกุลเงินอ้างอิง
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
              ~35.50 THB
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              อัตราแลกเปลี่ยนโดยประมาณต่อ 1 USDT
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (currentView === "zonebux") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
          hasCostData ? "xl:grid-cols-6" : "xl:grid-cols-5"
        } gap-4`}
      >
        {/* 1. ยอดรับในธนาคาร (Bank) */}
        <Card className="p-5 border-sky-100 bg-sky-50/40 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-900">
              ยอดรับในธนาคาร (Bank)
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-sky-800">
              {isLoading ? "..." : `+฿${formatMoney(bankIncome)}`}
            </div>
            <p className="text-xs text-sky-700/80 mt-1 font-semibold">
              {bankIncomeCount} รายการรับเข้าบัญชี
            </p>
          </div>
        </Card>

        {/* 2. ยอดรับในวอเลต (TrueMoney Wallet) */}
        <Card className="p-5 border-amber-200/80 bg-amber-50/40 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">
              ยอดรับในวอเลต (TrueMoney)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">
              {isLoading ? "..." : `+฿${formatMoney(walletIncome)}`}
            </div>
            <p className="text-xs text-amber-800/80 mt-1 font-semibold">
              {walletIncomeCount} รายการรับเข้าวอลเล็ท
            </p>
          </div>
        </Card>

        {/* 3. กระเป๋า Binance (USDT Wallet) */}
        <Card className="p-5 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-950">
              กระเป๋า Binance (USDT)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-900">
              {isLoading ? "..." : `฿${formatMoney(binanceBalance)}`}
            </div>
            <p className="text-xs text-amber-700/90 mt-1 font-semibold truncate" title={`เติม ฿${formatMoney(binanceDeposits)} • ใช้ ฿${formatMoney(binanceSpent)}`}>
              ≈ ${approxUsdt} USDT (พร้อมใช้สต็อก)
            </p>
          </div>
        </Card>

        {/* 4. ยอดขายรวม (Gross Sales) */}
        <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ยอดขายรวม (Gross Sales)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600">
              {isLoading ? "..." : `+฿${formatMoney(totalIncome)}`}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              ธนาคาร ฿${formatMoney(bankIncome)} • วอเลต ฿${formatMoney(walletIncome)}${
                binanceIncome > 0 ? ` • Binance ฿${formatMoney(binanceIncome)}` : ""
              }
            </p>
          </div>
        </Card>

        {/* 5. กำไรสุทธิรอโอนเงินเดือน (Net Profit) */}
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

        {/* 6. รายจ่ายร้านค้า (Store Expense) */}
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

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        hasCostData ? "lg:grid-cols-5" : "lg:grid-cols-4"
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

      {/* 2. กระเป๋า Binance (USDT Wallet) */}
      <Card className="p-5 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 shadow-xs rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-950">
            กระเป๋า Binance (USDT)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-900">
            {isLoading ? "..." : `฿${formatMoney(binanceBalance)}`}
          </div>
          <p className="text-xs text-amber-700/90 mt-1 font-semibold truncate" title={`เติม ฿${formatMoney(binanceDeposits)} • ใช้ ฿${formatMoney(binanceSpent)}`}>
            ≈ ${approxUsdt} USDT (พร้อมใช้สต็อก)
          </p>
        </div>
      </Card>

      {/* 3. รายรับ / ยอดขาย */}
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
