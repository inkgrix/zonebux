"use client";

import React, { useState, useMemo } from "react";
import { Transaction } from "@/types/transaction";
import { Card } from "./ui/card";
import { Trophy, Tag, Flame } from "lucide-react";

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");

  // Income items (filtered to customer top-ups/sales, excluding internal capital)
  const incomeCategories = useMemo(() => {
    const customerIncomes = transactions.filter(
      (t) =>
        t.type === "รายรับ" &&
        t.category !== "เงินทุนหมุนเวียน" &&
        t.category !== "เงินโอนสลับบัญชี"
    );

    const totalIncome = customerIncomes.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );

    const map: Record<string, { amount: number; count: number }> = {};
    customerIncomes.forEach((t) => {
      if (!map[t.category]) {
        map[t.category] = { amount: 0, count: 0 };
      }
      map[t.category].amount += Number(t.amount) || 0;
      map[t.category].count += 1;
    });

    return {
      total: totalIncome,
      items: Object.entries(map)
        .map(([cat, val]) => ({
          category: cat,
          amount: val.amount,
          count: val.count,
          percent: totalIncome > 0 ? (val.amount / totalIncome) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [transactions]);

  // Expenses breakdown
  const expenseCategories = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "รายจ่าย");
    const totalExpense = expenses.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );

    const map: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((t) => {
      if (!map[t.category]) {
        map[t.category] = { amount: 0, count: 0 };
      }
      map[t.category].amount += Number(t.amount) || 0;
      map[t.category].count += 1;
    });

    return {
      total: totalExpense,
      items: Object.entries(map)
        .map(([cat, val]) => ({
          category: cat,
          amount: val.amount,
          count: val.count,
          percent: totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [transactions]);

  const currentData = activeTab === "income" ? incomeCategories : expenseCategories;

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="p-5 border-slate-200/80 bg-white shadow-xs rounded-2xl">
      {/* Header with Title and Segmented Switcher */}
      <div className="space-y-3 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            {activeTab === "income" ? (
              <Trophy className="w-4 h-4 text-amber-500" />
            ) : (
              <Tag className="w-4 h-4 text-rose-500" />
            )}
            <span>
              {activeTab === "income" ? "จัดอันดับสินค้าที่ลูกค้าเติม" : "สัดส่วนรายจ่ายตามหมวดหมู่"}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            รวม ฿{formatMoney(currentData.total)}
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`py-1 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "income"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>ยอดเติม (อันดับ)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`py-1 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "expense"
                ? "bg-white text-rose-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>รายจ่าย</span>
          </button>
        </div>
      </div>

      {/* List / Ranking Items */}
      {currentData.items.length === 0 ? (
        <div className="py-7 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">ยังไม่มีข้อมูล</p>
          <p>
            {activeTab === "income"
              ? "เมื่อมีรายการเติม Robux หรือ Gamepass ข้อมูลจะจัดอันดับที่นี่"
              : "ยังไม่มีรายการรายจ่ายสำหรับคำนวณ"}
          </p>
        </div>
      ) : (
        <div className="mt-3.5 space-y-3">
          {currentData.items.slice(0, 5).map((item, index) => {
            const isIncome = activeTab === "income";

            // Rank badge styling for income
            const rankBadgeColor =
              index === 0
                ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                : index === 1
                ? "bg-slate-200 text-slate-700 border-slate-300 font-semibold"
                : index === 2
                ? "bg-orange-100 text-orange-800 border-orange-200 font-semibold"
                : "bg-slate-100 text-slate-600 border-slate-200 text-[10px]";

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 border ${rankBadgeColor}`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-[180px]">
                      {item.category}
                    </span>
                    {item.count > 0 && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({item.count} บิล)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span
                      className={`font-bold ${
                        isIncome ? "text-emerald-700" : "text-slate-900"
                      }`}
                    >
                      ฿{formatMoney(item.amount)}
                    </span>
                    <span className="text-slate-400 text-[11px] w-8 text-right font-medium">
                      {item.percent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isIncome
                        ? index === 0
                          ? "bg-emerald-500"
                          : "bg-sky-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(3, item.percent))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {currentData.items.length > 5 && (
            <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
              และหมวดหมู่อื่นๆ อีก {currentData.items.length - 5} รายการ
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
