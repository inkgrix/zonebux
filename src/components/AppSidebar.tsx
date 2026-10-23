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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Store,
  Landmark,
  PlusCircle,
  FileSpreadsheet,
  Wallet,
  RefreshCw,
  Lock,
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
  onLock?: () => void;
}

export function AppSidebar({
  currentView,
  onViewChange,
  onOpenAddModal,
  onRefresh,
  isLoading,
  transactionsCount,
  onLock,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white">
      {/* Sidebar Header: Brand Logo */}
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:py-3.5 border-b border-slate-100 flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center cursor-default">
                <div className="w-8.5 h-8.5 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                    ZoneBux
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium truncate">
                    ระบบบัญชีรายรับ-รายจ่าย
                  </span>
                </div>
              </div>
            }
          />
          <TooltipContent side="right" align="center">
            ZoneBux ระบบบัญชีรายรับ-รายจ่าย
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:space-y-3">
        {/* Quick Action Button */}
        <div className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="w-full h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 shrink-0"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span className="group-data-[collapsible=icon]:hidden">บันทึกรายการ</span>
                </button>
              }
            />
            <TooltipContent side="right" align="center">
              บันทึกรายการใหม่
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Group 1: แยกบัญชี / แหล่งที่มา (Account Separation) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            มุมมองบัญชี
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 1. ภาพรวมทั้งหมด */}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  isActive={currentView === "all"}
                  onClick={() => onViewChange("all")}
                  tooltip="ภาพรวมทั้งหมด"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center ${currentView === "all"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">ภาพรวมทั้งหมด</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.total}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. ร้าน ZoneBux */}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  isActive={currentView === "zonebux"}
                  onClick={() => onViewChange("zonebux")}
                  tooltip="ร้าน Zonebux"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center ${currentView === "zonebux"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <Store className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">ร้าน Zonebux</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.zonebux}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 3. บัญชีร้านทั่วไป */}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  isActive={currentView === "general"}
                  onClick={() => onViewChange("general")}
                  tooltip="บัญชีร้านทั่วไป"
                  className={`text-xs font-semibold rounded-xl h-9 transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center ${currentView === "general"
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <Landmark className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">บัญชีร้านทั่วไป</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">
                    {transactionsCount.general}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-slate-100 group-data-[collapsible=icon]:mx-3" />

        {/* Group 2: เครื่องมือและข้อมูล */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            ข้อมูลและการเชื่อมต่อ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* ซิงค์ข้อมูลล่าสุด */}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  onClick={onRefresh}
                  disabled={isLoading}
                  tooltip="ดึงข้อมูลล่าสุด"
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-9 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                >
                  <RefreshCw
                    className={`w-4 h-4 shrink-0 ${isLoading ? "animate-spin text-sky-600" : ""}`}
                  />
                  <span className="group-data-[collapsible=icon]:hidden">รีเฟรชข้อมูล</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ลิงก์ Google Sheets */}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  onClick={() => window.open("https://sheets.google.com", "_blank")}
                  tooltip="เปิด Google Sheets"
                  className="text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-9 cursor-pointer group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">เปิด Google Sheet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ล็อกหน้าจอ (Lock Screen) */}
              {onLock && (
                <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    onClick={onLock}
                    tooltip="ล็อกหน้าจอ (Lock)"
                    className="text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl h-9 cursor-pointer group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center transition-colors"
                  >
                    <Lock className="w-4 h-4 text-slate-500 hover:text-rose-600 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">ล็อกหน้าจอ (Lock)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer: Sync Status */}
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2 border-t border-slate-100">
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:justify-center rounded-lg bg-slate-50 text-slate-600 text-xs cursor-default">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 truncate group-data-[collapsible=icon]:hidden">
                  Google Sheets Connected
                </span>
              </div>
            }
          />
          <TooltipContent side="right" align="center">
            Google Sheets เชื่อมต่อแล้ว
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
