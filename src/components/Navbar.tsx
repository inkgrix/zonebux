import React from "react";
import { Button } from "./ui/button";
import { Wallet, RotateCw, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface NavbarProps {
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  status: "idle" | "loading" | "success" | "auth_required" | "error";
  statusMessage?: string;
}

export function Navbar({
  onOpenAddModal,
  onRefresh,
  isLoading,
  status,
  statusMessage,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                ZoneBux
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                Google Sheets
              </span>
            </div>
          </div>

          {/* Actions */}
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
              id="refresh-btn"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              title="ดึงข้อมูลล่าสุดจาก Google Sheet"
              className="gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>

            {/* Modal Trigger Button */}
            <Button
              id="open-add-modal-btn"
              variant="default"
              size="sm"
              onClick={onOpenAddModal}
              className="gap-1.5 font-semibold"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>บันทึกรายการ</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
