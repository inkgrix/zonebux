# 🎮 ZoneBux — In/Out Financial Management System

<div align="center">

![ZoneBux Banner](https://img.shields.io/badge/ZoneBux-Financial%20System-0284c7?style=for-the-badge&logo=roblox&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-Turbopack-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React%2019-0284c7?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Base%20UI-0f172a?style=for-the-badge)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Database%20API-34a853?style=for-the-badge&logo=googlesheets&logoColor=white)

<p align="center">
  <b>ระบบจัดการบัญชีรายรับ-รายจ่าย คำนวณต้นทุน และสรุปกำไรสุทธิอัตโนมัติ ออกแบบมาเฉพาะสำหรับร้านค้าดิจิทัลและร้านเติม Robux / Gamepass</b>
  <br />
  ซิงค์ข้อมูลสองทางแบบเรียลไทม์กับ Google Sheets พร้อมหน้าตาเว็บสไตล์ Light & Crisp มินิมอล โทนฟ้าคราม และฟอนต์ LINE Seed Sans TH
</p>

</div>

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Key Features)

### 1. ⚡ คำนวณต้นทุนและ Diff กำไรรายออเดอร์ (Order-level Cost & Diff Profit)
- บันทึก **ราคาขาย** คู่กับ **ต้นทุนสินค้า** พร้อมกันในบิลเดียว (เช่น ขาย 300 Robux ราคา 105 บาท ต้นทุน 86 บาท)
- แสดงกล่องสรุปผล **กำไรสุทธิ (`+฿19.00`)** และ **อัตรากำไร (`18.1% Margin`)** แบบ Real-time ทันทีที่พิมพ์ตัวเลข
- ในตารางประวัติธุรกรรม แสดงราคาขายตัวหนา พร้อมป้ายกำกับต้นทุนและกำไรชัดเจน: `+฿105.00` *(ทุน ฿86.00 • กำไร +฿19.00)*

### 2. 🏦 ระบบแยก 2 บัญชีแบบมืออาชีพ (Account Separation Architecture)
ป้องกันเงินร้านและเงินหมุนเวียนปนกัน ด้วยมุมมองแยกบัญชีผ่าน Sidebar:
- **🎮 ร้าน Zonebux (บัญชีรับเงินโอน):** แสดงเฉพาะเงินสดที่ลูกค้าโอนเข้ามา ยอดขายสินค้า ต้นทุน Robux และกำไรสุทธิที่เตรียมโอนออกเป็นเงินเดือนตอนสิ้นเดือน
- **🏦 บัญชีร้านทั่วไป (บัญชีจ่ายทุน/สต็อก):** แสดงเงินทุนหมุนเวียน เงินโอนสลับบัญชี ค่าเช่า VPS/เซิร์ฟเวอร์ และค่าใช้จ่ายจิปาถะของร้าน
- **📊 ภาพรวมทั้งหมด (`all`):** รวมกระแสเงินสดและสถิติจากทุกบัญชีแบบองค์รวม

### 3. 💳 ช่องทางรับเงิน (Payment Methods)
- รองรับทั้ง **🏦 บัญชีธนาคาร** และ **📱 ทรูมันนี่วอลเล็ท (TrueMoney Wallet)**
- เลือกผ่าน **shadcn/ui Select** ที่โค้งมน สวยงาม ใช้งานง่าย
- ป้าย Badge กำกับสีในตารางประวัติ พร้อมพิมพ์ค้นหาคำว่า `วอลเล็ท` หรือ `ธนาคาร` เพื่อกรองรายการได้ทันที

### 4. 🏆 จัดอันดับสินค้าที่ลูกค้าเติม (Top-up Category Ranking)
- จัดอันดับสินค้าขายดียอดนิยม **#1 🥇, #2 🥈, #3 🥉** อัตโนมัติ:
  - `Robux via ID-Pass`
  - `Robux via Username`
  - `Gamepass`
  - `ยอดขายไอดีเกม`
  - `อื่นๆ (ระบุเอง)`
- แสดงยอดขายสะสม จำนวนบิลที่ลูกค้าสั่งซื้อ (เช่น `12 บิล`) แถบ Progress bar และสัดส่วน % ยอดขาย

### 5. 🎨 Design & UI Architecture
- **Light & Crisp:** พื้นหลังสีขาวตัดโทนสีฟ้าอ่อน (`#0284c7`) สะอาดตา สบายตา ไร้แสงนีออน ไม่แสบตา
- **Typography:** ฟอนต์ **LINE Seed Sans TH** ทุกน้ำหนักครอบคลุมทั้งระบบ
- **Official shadcn/ui:** ใช้คอมโพเนนต์ทางการของ shadcn (`@base-ui/react` + Tailwind CSS v4) เช่น Sidebar, Dialog, Select, Card, Button, Input, Badge, Tooltip

---

## 💼 เวิร์กโฟลว์การเงินและการตัดรอบสิ้นเดือน (Accounting Workflow)

```
[ ลูกค้าสั่งซื้อ Robux ] ──> บัญชีรับเงิน (Zonebux)
                              • เงินสดสะสมเข้าบัญชี 100% (ตรวจตรงกับแอปธนาคาร)

[ เงินทุนหมุนเวียน ]     ──> บัญชีร้านทั่วไป
                              • โอนจ่ายซื้อ Robux / USDT ส่งให้ลูกค้า
```

#### 🗓️ สิ้นเดือน (รอบตัดเงินเดือน) ทำง่ายๆ เพียง 2 ขั้นตอน:
1. ดูตัวเลข **"ทุนรวม"** ในระบบ ➡️ โอนเงินต้นทุนจากบัญชีรับเงิน คืนกลับเข้าบัญชีร้านทั่วไป (เพื่อเติมทุนหมุนเวียนให้เต็มเท่าเดิม)
2. เงินคงเหลือในบัญชีรับเงินเป๊ะๆ คือ **"กำไรสุทธิรอโอนเงินเดือน"** ➡️ โอนเข้าบัญชีส่วนตัวเป็นเงินเดือนได้ทันที เงินไม่ปนกัน 100%

---

## 📊 โครงสร้างตาราง Google Sheets (Columns A - J)

| คอลัมน์ | ชื่อหัวตาราง (Header) | ตัวอย่างข้อมูล | คำอธิบาย |
| :---: | :--- | :--- | :--- |
| **A** | `ID` | `tx_172979...` | รหัสอ้างอิงรายการ |
| **B** | `Date` | `2026-10-24` | วันที่ทำรายการ (YYYY-MM-DD) |
| **C** | `Type` | `รายรับ` / `รายจ่าย` | ประเภทรายการ |
| **D** | `Category` | `Robux via ID-Pass` | หมวดหมู่สินค้าหรือค่าใช้จ่าย |
| **E** | `Amount` | `105` | ราคาขาย / ยอดเงินเข้า-ออก |
| **F** | `Note` | `300 Robux ลูกค้าชื่อสมชาย` | หมายเหตุ / ข้อมูลเพิ่มเติม |
| **G** | `Account` | `ร้าน Zonebux` / `บัญชีร้านทั่วไป` | บัญชีที่เกี่ยวข้อง |
| **H** | `Cost` | `86` | ต้นทุนสินค้า (เฉพาะรายรับที่มีต้นทุน) |
| **I** | `Profit` | `19` | กำไรส่วนต่างสุทธิ (Amount - Cost) |
| **J** | `PaymentMethod` | `บัญชีธนาคาร` / `ทรูมันนี่วอลเล็ท` | ช่องทางรับเงิน |

---

## ⚙️ โค้ด Google Apps Script (`Code.gs`)

1. ใน Google Sheet ของคุณ ไปที่เมนู **ส่วนขยาย (Extensions) > Apps Script**
2. แทนที่โค้ดทั้งหมดด้วยโค้ดด้านล่างนี้:

```javascript
/**
 * ZoneBux Google Apps Script API
 * รองรับการบันทึก Cost, Profit และ PaymentMethod
 */
function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const idIdx = headers.indexOf("id");
    const dateIdx = headers.indexOf("date");
    const typeIdx = headers.indexOf("type");
    const catIdx = headers.indexOf("category");
    const amtIdx = headers.indexOf("amount");
    const noteIdx = headers.indexOf("note");
    const accIdx = headers.indexOf("account");
    const costIdx = headers.indexOf("cost");
    const profitIdx = headers.indexOf("profit");
    const payIdx = headers.indexOf("paymentmethod") !== -1 ? headers.indexOf("paymentmethod") : headers.indexOf("channel");

    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[amtIdx !== -1 ? amtIdx : 4]) continue;

      let dateVal = row[dateIdx !== -1 ? dateIdx : 1];
      if (dateVal instanceof Date) {
        dateVal = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }

      const amount = Number(row[amtIdx !== -1 ? amtIdx : 4]) || 0;
      const rawCost = costIdx !== -1 ? row[costIdx] : "";
      const cost = (rawCost !== "" && !isNaN(Number(rawCost)) && Number(rawCost) > 0) ? Number(rawCost) : "";
      const rawProfit = profitIdx !== -1 ? row[profitIdx] : "";
      const profit = cost !== "" ? (amount - Number(cost)) : (rawProfit !== "" && !isNaN(Number(rawProfit)) && Number(rawProfit) > 0 && Number(rawProfit) < amount ? Number(rawProfit) : "");

      rows.push({
        id: String(row[idIdx !== -1 ? idIdx : 0] || "row-" + i),
        date: String(dateVal || ""),
        type: String(row[typeIdx !== -1 ? typeIdx : 2] || "รายรับ"),
        category: String(row[catIdx !== -1 ? catIdx : 3] || "ทั่วไป"),
        amount: amount,
        note: String(noteIdx !== -1 && row[noteIdx] !== undefined ? row[noteIdx] : ""),
        account: String(accIdx !== -1 && row[accIdx] ? row[accIdx] : "ร้าน Zonebux"),
        cost: cost !== "" ? Number(cost) : undefined,
        profit: profit !== "" ? Number(profit) : undefined,
        paymentMethod: String(payIdx !== -1 && row[payIdx] ? row[payIdx] : "")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: rows
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || "create";

    const data = sheet.getDataRange().getValues();
    const headers = data.length > 0 ? data[0].map(h => String(h).trim().toLowerCase()) : [];
    const idIdx = headers.indexOf("id") !== -1 ? headers.indexOf("id") : 0;

    // 🗑️ ACTION: DELETE
    if (action === "delete") {
      const targetId = String(contents.id || "");
      for (let i = 1; i < data.length; i++) {
        const rowId = String(data[i][idIdx]);
        if (rowId === targetId || ("row-" + i) === targetId) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Deleted successfully",
            id: targetId
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Transaction ID not found: " + targetId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ✏️ ACTION: UPDATE
    if (action === "update") {
      const targetId = String(contents.id || "");
      let targetRowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        const rowId = String(data[i][idIdx]);
        if (rowId === targetId || ("row-" + i) === targetId) {
          targetRowIndex = i + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Transaction ID not found: " + targetId
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const dateIdx = headers.indexOf("date");
      const typeIdx = headers.indexOf("type");
      const catIdx = headers.indexOf("category");
      const amtIdx = headers.indexOf("amount");
      const noteIdx = headers.indexOf("note");
      const accIdx = headers.indexOf("account");
      const costIdx = headers.indexOf("cost");
      const profitIdx = headers.indexOf("profit");
      const payIdx = headers.indexOf("paymentmethod") !== -1 ? headers.indexOf("paymentmethod") : headers.indexOf("channel");

      const amount = Number(contents.amount) || 0;
      const hasCost = contents.cost !== undefined && contents.cost !== "" && !isNaN(Number(contents.cost)) && Number(contents.cost) > 0;
      const cost = hasCost ? Number(contents.cost) : "";
      const profit = (contents.type || "รายรับ") === "รายรับ" && hasCost ? (amount - Number(contents.cost)) : "";

      if (dateIdx !== -1) sheet.getRange(targetRowIndex, dateIdx + 1).setValue(contents.date);
      if (typeIdx !== -1) sheet.getRange(targetRowIndex, typeIdx + 1).setValue(contents.type);
      if (catIdx !== -1) sheet.getRange(targetRowIndex, catIdx + 1).setValue(contents.category);
      if (amtIdx !== -1) sheet.getRange(targetRowIndex, amtIdx + 1).setValue(amount);
      if (noteIdx !== -1) sheet.getRange(targetRowIndex, noteIdx + 1).setValue(contents.note || "");
      if (accIdx !== -1) sheet.getRange(targetRowIndex, accIdx + 1).setValue(contents.account || "ร้าน Zonebux");
      if (costIdx !== -1) sheet.getRange(targetRowIndex, costIdx + 1).setValue(cost);
      if (profitIdx !== -1) sheet.getRange(targetRowIndex, profitIdx + 1).setValue(profit);
      if (payIdx !== -1) sheet.getRange(targetRowIndex, payIdx + 1).setValue(contents.paymentMethod || "");

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Updated successfully",
        data: contents
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ➕ ACTION: CREATE (Default)
    const id = contents.id || "tx_" + new Date().getTime();
    const date = contents.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const type = contents.type || "รายรับ";
    const category = contents.category || "ทั่วไป";
    const amount = Number(contents.amount) || 0;
    const note = contents.note || "";
    const account = contents.account || "ร้าน Zonebux";
    const hasCost = contents.cost !== undefined && contents.cost !== "" && !isNaN(Number(contents.cost)) && Number(contents.cost) > 0;
    const cost = hasCost ? Number(contents.cost) : "";
    const profit = type === "รายรับ" && hasCost ? (amount - Number(contents.cost)) : "";
    const paymentMethod = contents.paymentMethod || "";

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ID", "Date", "Type", "Category", "Amount", "Note", "Account", "Cost", "Profit", "PaymentMethod"]);
    }

    sheet.appendRow([id, date, type, category, amount, note, account, cost, profit, paymentMethod]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Saved successfully",
      data: { id, date, type, category, amount, note, account, cost, profit, paymentMethod }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. คลิก **Deploy (ทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้ใหม่)**
   - ชนิด: **เว็บแอป (Web app)**
   - ดำเนินการในฐานะ: **ฉัน (Me)**
   - ผู้มีสิทธิ์เข้าถึง: **ทุกคน (Anyone)** *(สำคัญมาก เพื่อให้ API เรียกได้โดยไม่ต้องล็อกอิน Google)*
4. คัดลอก **URL เว็บแอป (Web App URL)** มาใส่ใน `.env.local`

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
```bash
git clone https://github.com/your-username/zonebux-in-out.git
cd zonebux-in-out
npm install
```

### 2. กำหนดค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
```bash
cp .env.example .env.local
```
แก้ไขไฟล์ `.env.local` แล้วใส่ Web App URL ของคุณ:
```env
GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Security PIN (รหัสล็อกหน้าจอ 4-6 หลัก ค่าเริ่มต้นคือ 1234)
NEXT_PUBLIC_APP_PIN=1234
```

### 3. รัน Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 4. Build สำหรับ Production
```bash
npm run build
npm start
```

---

## 🌐 การนำไปขึ้น Vercel (Deployment)

1. Push โปรเจกต์ขึ้น **GitHub Repository**
2. ไปที่ [Vercel Dashboard](https://vercel.com) > คลิก **Add New... > Project**
3. นำเข้า Repository นี้
4. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   - **Key:** `GOOGLE_SHEET_API_URL`
   - **Value:** `URL ของ Google Apps Script ของคุณ`
5. คลิก **Deploy** — ระบบจะ Build และพร้อมใช้งานได้ภายใน 1 นาที!

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Base UI engine)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** LINE Seed Sans TH (WOFF2)
- **Database & Sync:** Google Sheets + Google Apps Script

---

<div align="center">
  <sub>พัฒนาด้วยความใส่ใจใน UX/UI สำหรับร้านค้าเกม ZoneBux © 2026</sub>
</div>
