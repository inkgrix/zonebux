export type TransactionType = "รายรับ" | "รายจ่าย";
export type AccountType = "ร้าน Zonebux" | "บัญชีร้านทั่วไป";
export type PaymentMethod = "บัญชีธนาคาร" | "ทรูมันนี่วอลเล็ท" | "Binance (USDT)";

export interface Transaction {
  id?: string;
  date: string;       // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;     // ราคาขาย หรือ ยอดเงินเข้า/ออก
  cost?: number;       // ต้นทุนสินค้า (สำหรับคำนวณกำไร)
  costPaymentMethod?: PaymentMethod | string; // ช่องทางจ่ายต้นทุน (เช่น Binance (USDT))
  profit?: number;     // กำไร (amount - cost)
  note?: string;
  account?: AccountType;
  paymentMethod?: PaymentMethod | string;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export const ACCOUNTS: AccountType[] = ["ร้าน Zonebux", "บัญชีร้านทั่วไป"];
export const PAYMENT_METHODS: PaymentMethod[] = [
  "บัญชีธนาคาร",
  "ทรูมันนี่วอลเล็ท",
  "Binance (USDT)",
];

// หมวดหมู่เฉพาะของ "ร้าน Zonebux"
export const ZONEBUX_INCOME_CATEGORIES = [
  "Robux via ID-Pass",
  "Robux via Username",
  "Gamepass",
  "ยอดขายไอดีเกม",
  "ค่าบริการ / เติมเกมอื่นๆ",
  "อื่นๆ (ระบุเอง)",
] as const;

export const ZONEBUX_EXPENSE_CATEGORIES = [
  "ต้นทุนซื้อ Robux / สต็อกเหรียญ",
  "เติมเงินเข้า Binance (โยกเงิน / ซื้อ USDT)",
  "ค่า VPS / เซิร์ฟเวอร์ / บอท",
  "ค่าโปรโมท / การตลาด",
  "ค่าบริการระบบ",
  "เงินคืน / ชดเชยลูกค้า",
  "อื่นๆ (ระบุเอง)",
] as const;

// หมวดหมู่เฉพาะของ "บัญชีร้านทั่วไป"
export const GENERAL_INCOME_CATEGORIES = [
  "เงินทุนหมุนเวียน",
  "เงินโอนสลับบัญชี",
  "เงินโอนคืน",
  "ดอกเบี้ยธนาคาร",
  "อื่นๆ (ระบุเอง)",
] as const;

export const GENERAL_EXPENSE_CATEGORIES = [
  "เติมเงินเข้า Binance (โยกเงิน / ซื้อ USDT)",
  "ค่าใช้จ่ายจิปาถะ",
  "เงินโอนสลับบัญชี",
  "ค่า VPS / เซิร์ฟเวอร์",
  "ค่าโปรโมท / การตลาด",
  "ถอนเงินเข้าส่วนตัว",
  "ค่าเน็ต / ค่าไฟ",
  "ค่าธรรมเนียมธนาคาร",
  "อื่นๆ (ระบุเอง)",
] as const;

// Fallback lists
export const INCOME_CATEGORIES = [
  "ยอดขาย Robux / เหรียญเกม",
  "ค่าบริการ / เติมเกม",
  "เงินทุนหมุนเวียน",
  "เงินโอนสลับบัญชี",
  "อื่นๆ (ระบุเอง)",
] as const;

export const EXPENSE_CATEGORIES = [
  "ต้นทุนซื้อ Robux / สต็อกเหรียญ",
  "เติมเงินเข้า Binance (โยกเงิน / ซื้อ USDT)",
  "ค่าใช้จ่ายจิปาถะ",
  "ค่า VPS / เซิร์ฟเวอร์",
  "ค่าโปรโมท / การตลาด",
  "ถอนเงินเข้าส่วนตัว",
  "ค่าธรรมเนียมธนาคาร",
  "อื่นๆ (ระบุเอง)",
] as const;

// Helper: ตรวจสอบว่ารายการนี้คือการเติมเงิน/โยกเงินเข้ากระเป๋า Binance หรือไม่
export function isBinanceDepositTx(t: {
  category?: string;
  note?: string;
  paymentMethod?: string;
}): boolean {
  const cat = t.category || "";
  const note = (t.note || "").toLowerCase();
  const pm = (t.paymentMethod || "").toLowerCase();

  if (cat.includes("เติมเงินเข้า Binance") || cat.includes("ซื้อ USDT")) {
    return true;
  }

  // รองรับรายการเงินโอนสลับบัญชีเดิมที่มีระบุคำว่า usdt หรือ binance ในหมายเหตุ
  if (
    cat.includes("เงินโอนสลับบัญชี") &&
    (note.includes("usdt") || note.includes("binance") || pm.includes("binance"))
  ) {
    return true;
  }

  return false;
}

// Helper: ตรวจสอบว่ารายการนี้คือการจ่ายเงินออกจากกระเป๋า Binance หรือไม่
export function isBinanceExpenseTx(t: {
  type?: string;
  category?: string;
  paymentMethod?: string;
  note?: string;
}): boolean {
  if (t.type !== "รายจ่าย") return false;
  if (isBinanceDepositTx(t)) return false;
  const pm = (t.paymentMethod || "").toLowerCase();
  return pm.includes("binance") || pm.includes("usdt");
}

// Helper: ตรวจสอบว่ารายการขาย (รายรับ) นี้ระบุว่าจ่ายต้นทุนสินค้าด้วย Binance หรือไม่
export function isBinanceCostTx(t: {
  type?: string;
  cost?: number;
  costPaymentMethod?: string;
  note?: string;
}): boolean {
  if (t.type !== "รายรับ") return false;
  if (!t.cost || Number(t.cost) <= 0) return false;
  const cpm = (t.costPaymentMethod || "").toLowerCase();
  const note = (t.note || "").toLowerCase();
  return (
    cpm.includes("binance") ||
    cpm.includes("usdt") ||
    note.includes("ทุน: binance") ||
    note.includes("ทุน:binance") ||
    note.includes("ต้นทุน: binance")
  );
}
