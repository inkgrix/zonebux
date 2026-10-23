"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Store,
  Landmark,
  PlusCircle,
  FileSpreadsheet,
  Wallet,
  RefreshCw,
} from "lucide-react";

export type AccountView = "all" | "zonebux" | "general";

interface AppSidebarProps {
  currentView: AccountView;
  onViewChange: (view: AccountView) => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  transactionsCount: {
    total: number;
    zonebux: number;
    general: number;
  };
}

export function AppSidebar({
  currentView,
  onViewChange,
  onOpenAddModal,
  onRefresh,
  isLoading,
  transactionsCount,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white">
      {/* Sidebar Header: Brand Logo */}
      <SidebarHeader className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
              ZoneBux
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ระบบบัญชีรายรับ-รายจ่าย
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Quick Action Button */}
        <div className="px-2 group-data-[collapsible=icon]:px-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-full h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer group-data-[collapsible=icon]:p-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="group-data-[collapsible=icon]:hidden">บันทึกรายการ</span>
          </button>
        </div>

        {/* Group 1: แยกบัญชี / แหล่งที่มา (Account Separation) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
            มุมมองบัญชี
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 1. ภาพรวมทั้งหมด */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentView === "all"}
                  onClick={() => onViewChange("all")}
                  tooltip="ภาพรวมทั้งหมด"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors ${
                    currentView === "all"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>ภาพรวมทั้งหมด</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.total}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. ร้าน ZoneBux */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentView === "zonebux"}
                  onClick={() => onViewChange("zonebux")}
                  tooltip="ร้าน Zonebux"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors ${
                    currentView === "zonebux"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Store className="w-4 h-4 text-sky-600" />
                  <span>ร้าน Zonebux</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.zonebux}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 3. บัญชีร้านทั่วไป */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentView === "general"}
                  onClick={() => onViewChange("general")}
                  tooltip="บัญชีร้านทั่วไป"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors ${
                    currentView === "general"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  <span>บัญชีร้านทั่วไป</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.general}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-slate-100" />

        {/* Group 2: เครื่องมือและข้อมูล */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
            ข้อมูลและการเชื่อมต่อ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* ซิงค์ข้อมูลล่าสุด */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onRefresh}
                  disabled={isLoading}
                  tooltip="ดึงข้อมูลล่าสุด"
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-9"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-600" : ""}`}
                  />
                  <span>รีเฟรชข้อมูล</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ลิงก์ Google Sheets */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.open("https://sheets.google.com", "_blank")}
                  tooltip="เปิด Google Sheets"
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-9 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>เปิด Google Sheet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer: Sync Status */}
      <SidebarFooter className="p-3 border-t border-slate-100 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-600 truncate">
            Google Sheets Connected
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
