import { NextResponse } from "next/server";
import { Transaction } from "@/types/transaction";

const SCRIPT_URL = process.env.GOOGLE_SHEET_API_URL || "";

export async function GET() {
  try {
    if (!SCRIPT_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "ยังไม่ได้กำหนด GOOGLE_SHEET_API_URL ใน Environment Variables (.env.local)",
        },
        { status: 500 }
      );
    }

    const res = await fetch(SCRIPT_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();

    if (text.includes("<!DOCTYPE html>") || text.includes("accounts.google.com")) {
      return NextResponse.json(
        {
          status: "auth_required",
          message:
            "Google Sheet ต้องการสิทธิ์เข้าถึง (โปรดตั้งค่า 'ผู้มีสิทธิ์เข้าถึง' ใน Apps Script เป็น 'ทุกคน / Anyone')",
          data: [],
        },
        { status: 200 }
      );
    }

    try {
      const data = JSON.parse(text);
      const normalizedData = (Array.isArray(data.data) ? data.data : []).map(
        (item: Record<string, unknown>, idx: number) => {
          const amount = Number(item.Amount || item.amount || 0);
          const rawCost = item.Cost ?? item.cost;
          const cost =
            rawCost !== undefined &&
            rawCost !== "" &&
            rawCost !== null &&
            !isNaN(Number(rawCost)) &&
            Number(rawCost) > 0
              ? Number(rawCost)
              : undefined;

          // Profit should only exist when an actual cost was tracked (Order-level diff)
          const rawProfit = item.Profit ?? item.profit;
          const profit =
            cost !== undefined
              ? amount - cost
              : rawProfit !== undefined &&
                rawProfit !== "" &&
                rawProfit !== null &&
                !isNaN(Number(rawProfit)) &&
                Number(rawProfit) > 0 &&
                Number(rawProfit) < amount
              ? Number(rawProfit)
              : undefined;

          return {
            id: String(item.ID || item.id || `row-${idx}`),
            date: String(item.Date || item.date || new Date().toISOString().split("T")[0]),
            type: String(item.Type || item.type || "รายรับ") as "รายรับ" | "รายจ่าย",
            category: String(item.Category || item.category || "ทั่วไป"),
            account: (item.Account || item.account || "ร้าน Zonebux") as "ร้าน Zonebux" | "บัญชีร้านทั่วไป",
            amount,
            cost,
            profit,
            paymentMethod: String(item.PaymentMethod || item.paymentMethod || item.Channel || item.channel || ""),
            note: String(item.Note || item.note || ""),
          };
        }
      );

      return NextResponse.json({
        status: "success",
        data: normalizedData,
      });
    } catch {
      return NextResponse.json({
        status: "error",
        message: "ไม่สามารถแปลงข้อมูลที่ได้จาก Google Apps Script เป็น JSON ได้",
        raw: text.slice(0, 200),
      });
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${errMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Transaction = await request.json();

    if (!body.amount || isNaN(Number(body.amount))) {
      return NextResponse.json(
        { status: "error", message: "กรุณาระบุจำนวนเงินที่ถูกต้อง" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    const hasCost = body.cost !== undefined && body.cost !== null && !isNaN(Number(body.cost)) && Number(body.cost) > 0;
    const cost = hasCost ? Number(body.cost) : "";
    const profit = body.type === "รายรับ" && hasCost ? amount - Number(body.cost) : "";

    const payload = {
      id: body.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: body.date || new Date().toISOString().split("T")[0],
      type: body.type || "รายรับ",
      category: body.category || "ทั่วไป",
      amount: amount,
      cost: cost,
      profit: profit,
      note: body.note || "",
      account: body.account || "ร้าน Zonebux",
      paymentMethod: body.paymentMethod || "",
    };

    if (!SCRIPT_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "ยังไม่ได้กำหนด GOOGLE_SHEET_API_URL ใน Environment Variables (.env.local)",
        },
        { status: 500 }
      );
    }

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await res.text();

    if (text.includes("<!DOCTYPE html>") || text.includes("accounts.google.com")) {
      return NextResponse.json(
        {
          status: "auth_required",
          message:
            "บันทึกไม่สำเร็จ: Google Sheet ต้องการสิทธิ์ (โปรดตั้งค่า 'ผู้มีสิทธิ์เข้าถึง' ใน Apps Script เป็น 'ทุกคน / Anyone')",
        },
        { status: 403 }
      );
    }

    try {
      const result = JSON.parse(text);
      return NextResponse.json({
        status: "success",
        message: "บันทึกลง Google Sheet เรียบร้อยแล้ว",
        data: payload,
        remoteResponse: result,
      });
    } catch {
      return NextResponse.json({
        status: "success",
        message: "ส่งข้อมูลไปยัง Google Sheet เรียบร้อยแล้ว",
        data: payload,
      });
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: `ไม่สามารถบันทึกข้อมูลได้: ${errMessage}` },
      { status: 500 }
    );
  }
}
