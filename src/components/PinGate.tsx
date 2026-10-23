"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Lock, Delete, RotateCcw, Check, AlertCircle } from "lucide-react";

interface PinGateProps {
  onUnlock: () => void;
  expectedPin?: string;
}

export function PinGate({
  onUnlock,
  expectedPin = process.env.NEXT_PUBLIC_APP_PIN || "1234",
}: PinGateProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [rememberMe] = useState<boolean>(true);

  const pinLength = expectedPin.length || 4;

  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess || pin.length >= pinLength) return;
      setError("");
      setPin((prev) => prev + digit);
    },
    [isSuccess, pin.length, pinLength]
  );

  const handleDelete = useCallback(() => {
    if (isSuccess) return;
    setError("");
    setPin((prev) => prev.slice(0, -1));
  }, [isSuccess]);

  const handleClear = useCallback(() => {
    if (isSuccess) return;
    setError("");
    setPin("");
  }, [isSuccess]);

  // Validate PIN whenever full length is reached
  useEffect(() => {
    if (pin.length === pinLength) {
      if (pin === expectedPin) {
        setIsSuccess(true);
        setError("");

        // Store unlock session
        if (rememberMe) {
          // 7 days remember
          const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem("zonebux_pin_unlocked", String(expiry));
          sessionStorage.removeItem("zonebux_pin_unlocked");
        } else {
          sessionStorage.setItem("zonebux_pin_unlocked", "true");
          localStorage.removeItem("zonebux_pin_unlocked");
        }

        const timer = setTimeout(() => {
          onUnlock();
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setIsShaking(true);
        setError("รหัส PIN ไม่ถูกต้อง โปรดลองอีกครั้ง");
        const timer = setTimeout(() => {
          setPin("");
          setIsShaking(false);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, pinLength, expectedPin, rememberMe, onUnlock]);

  // Support physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDigit, handleDelete, handleClear]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-sky-500/20">
      <div
        className={`max-w-xs sm:max-w-sm w-full bg-white border border-slate-200/90 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 text-center animate-modalIn ${isShaking ? "animate-shake border-rose-300" : ""
          }`}
      >
        {/* Header Icon & Brand */}
        <div className="space-y-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs transition-colors duration-200 ${isSuccess
              ? "bg-emerald-100 text-emerald-600 scale-105"
              : error
                ? "bg-rose-100 text-rose-600"
                : "bg-sky-50 text-sky-600 border border-sky-100"
              }`}
          >
            {isSuccess ? (
              <Check className="w-7 h-7 stroke-[3]" />
            ) : error ? (
              <AlertCircle className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-[11px] font-bold text-sky-800 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>ZoneBux Security Gate</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              ใส่รหัส PIN เพื่อเข้าใช้งาน
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบบัญชีการเงินและกำไรของร้านค้า
            </p>
          </div>
        </div>

        {/* Visual PIN Dots */}
        <div className="py-2">
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: pinLength }).map((_, idx) => {
              const isFilled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${isSuccess
                    ? "bg-emerald-500 border-2 border-emerald-500 scale-110"
                    : isFilled
                      ? "bg-sky-600 border-2 border-sky-600 scale-110 shadow-xs"
                      : "bg-slate-100 border-2 border-slate-300"
                    }`}
                />
              );
            })}
          </div>

          {/* Error Message Feedback */}
          {error ? (
            <p className="text-xs font-semibold text-rose-600 mt-3 animate-modalIn flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-3">
              พิมพ์รหัสผ่านตัวเลข {pinLength} หลักผ่านแป้นพิมพ์หรือปุ่มด้านล่าง
            </p>
          )}
        </div>

        {/* On-screen Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              disabled={isSuccess}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 text-lg font-bold border border-slate-200/70 shadow-2xs transition-all cursor-pointer select-none flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Bottom Row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pin.length === 0}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 text-xs font-bold border border-slate-200/70 shadow-2xs transition-all cursor-pointer select-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="ล้างทั้งหมด"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDigit("0")}
            disabled={isSuccess}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 text-lg font-bold border border-slate-200/70 shadow-2xs transition-all cursor-pointer select-none flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isSuccess || pin.length === 0}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 text-xs font-bold border border-slate-200/70 shadow-2xs transition-all cursor-pointer select-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="ลบตัวเลขล่าสุด"
          >
            <Delete className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-400">
        <p>© 2026 ZoneBux Financial System</p>
      </div>
    </div>
  );
}
