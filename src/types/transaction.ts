export type TransactionType = "รายรับ" | "รายจ่าย";
export type AccountType = "ร้าน Zonebux" | "บัญชีร้านทั่วไป";
export type PaymentMethod = "บัญชีธนาคาร" | "ทรูมันนี่วอลเล็ท";

export interface Transaction {
  id?: string;
  date: string;       // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;     // ราคาขาย หรือ ยอดเงินเข้า/ออก
  cost?: number;       // ต้นทุนสินค้า (สำหรับคำนวณกำไร)
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
export const PAYMENT_METHODS: PaymentMethod[] = ["บัญชีธนาคาร", "ทรูมันนี่วอลเล็ท"];

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
  "ค่าใช้จ่ายจิปาถะ",
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
  "ค่าใช้จ่ายจิปาถะ",
  "ค่า VPS / เซิร์ฟเวอร์",
  "ค่าโปรโมท / การตลาด",
  "ถอนเงินเข้าส่วนตัว",
  "ค่าธรรมเนียมธนาคาร",
  "อื่นๆ (ระบุเอง)",
] as const;
