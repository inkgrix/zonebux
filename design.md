# ZoneBux Design System & Architecture

## 1. Design Philosophy
- **Light & Crisp (เว็บขาวโทนฟ้าอ่อน)**: ออกแบบด้วยพื้นหลังสีขาวสว่าง สะอาดตา ตัดด้วยโทนสีฟ้าอ่อน (Soft Sky Blue) ที่ดูสุภาพ เป็นมิตร และสบายตา
- **No AI Slop / No Neon Gradients**: หลีกเลี่ยงการใช้สีนีออนฉูดฉาด การไล่เฉดสีฟุ้งเบลอ (Blob Gradients) หรือลูกเล่น Glassmorphism ที่รกสายตา เน้นความเรียบง่าย สไตล์ Minimal Corporate ที่ใช้งานได้จริง
- **No Dark Mode**: มุ่งเน้นการใช้งานในรูปแบบ Light Theme เพียงอย่างเดียว เพื่อความเรียบง่าย คมชัด และสม่ำเสมอในทุกหน้าจอ
- **Modal-Centric UX**: ออกแบบประสบการณ์การบันทึกข้อมูลให้อยู่ในรูปแบบ Modal/Dialog ที่เปิดใช้งานได้สะดวกรวดเร็ว บันทึกเสร็จแล้วปิดทันที ไม่ต้องโหลดสลับหน้า
- **Official Shadcn/UI Architecture**: ใช้โครงสร้างและสไตล์คอมโพเนนต์ทางการของ shadcn/ui บน `@base-ui/react` และ Tailwind CSS v4 พร้อม `components.json` โดยติดตั้งผ่าน CLI ห้ามสร้างคอมโพเนนต์ขึ้นมาเองโดยพลการ

---

## 2. Typography (ฟอนต์ทั้งระบบ)

* **Font Family:** `LINE Seed Sans TH`
* **Source:** [public/font](file:///Users/inkgrix/zonebux-In-out/public/font)
* **น้ำหนักที่รองรับ:**
  * Thin (300) — `LINESeedSansTH_W_Th.woff2`
  * Regular (400) — `LINESeedSansTH_W_Rg.woff2`
  * Bold (700) — `LINESeedSansTH_W_Bd.woff2`
  * Extra Bold (800) — `LINESeedSansTH_W_XBd.woff2`
  * Heavy (900) — `LINESeedSansTH_W_He.woff2`
* **Hierarchy:**
  * `Heading 1` (ภาพรวมการเงิน): `text-xl sm:text-2xl font-extrabold tracking-tight`
  * `Card Metric` (ยอดเงินตัวใหญ่): `text-2xl sm:text-3xl font-extrabold tracking-tight`
  * `Card Header / Section`: `text-base font-bold`
  * `Body Text`: `text-xs sm:text-sm text-slate-700`
  * `Caption / Date / Note`: `text-xs text-slate-400`
  * `Micro Badge / Metadata`: `text-[10px] / text-[11px] font-semibold`

---

## 3. Color Palette (ชุดสี)

| บทบาท | ค่าสี Tailwind / CSS Variable | รหัสสี HEX / OKLCH | การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-slate-50` / `--background` | `oklch(1 0 0)` / `#f8fafc` | พื้นหลังหลักของหน้าเว็บ |
| **Card Surface** | `bg-white` / `--card` | `oklch(1 0 0)` / `#ffffff` | กล่อง Card, Dialog, Popover |
| **Border / Divider** | `border-slate-200` / `--border` | `oklch(0.922 0 0)` / `#e2e8f0` | เส้นขอบกล่อง, เส้นแบ่งรายการ |
| **Subtle Divider** | `divide-slate-100` | `#f1f5f9` | เส้นแบ่งแถวประวัติรายการ |
| **Primary Accent** | `bg-sky-600` / `--primary` | `oklch(0.588 0.158 241.966)` / `#0284c7` | ปุ่มหลัก (CTA), ลิงก์สำคัญ, แท็บที่เลือก |
| **Primary Hover** | `hover:bg-sky-700` | `#0369a1` | สถานะ Hover ของปุ่มหลัก |
| **Soft Sky Surface** | `bg-sky-50` / `text-sky-700` | `#f0f9ff` | แถบสถานะ, ป้าย Badge, กล่อง CTA ย่อย |
| **Text Primary** | `text-slate-900` / `--foreground` | `oklch(0.145 0 0)` / `#0f172a` | หัวข้อหลัก, ตัวเลขยอดเงิน |
| **Text Secondary** | `text-slate-600` | `#475569` | คำอธิบายย่อย, ป้ายกำกับฟอร์ม |
| **Text Muted** | `text-slate-400` / `--muted-foreground` | `oklch(0.556 0 0)` / `#94a3b8` | วันที่, หมายเหตุย่อย, Placeholder |
| **Income Indicator** | `text-emerald-600` / `bg-emerald-50` | `#059669` / `#ecfdf5` | แสดงตัวเลขและสถานะรายรับ |
| **Expense Indicator** | `text-rose-600` / `bg-rose-50` | `#e11d48` / `#fff1f2` | แสดงตัวเลขและสถานะรายจ่าย |

---

## 4. Spacing & UX Guidelines (กติกาช่องไฟและการจัดวาง)

* **Single-Padding Model (แก้ปัญหา Padding ซ้อน):**
  * ห้ามใส่ Padding ซ้อนทับกันระหว่าง Card ชั้นนอกและเนื้อหาชั้นใน
  * กล่องการ์ดสรุปยอดเงินและ Sidebar ใช้ Padding ชั้นเดียวคือ `p-5`
  * การ์ดที่มีรายการตาราง ใช้ Header `p-5 pb-4 border-b` และให้ตารางด้านล่างชิดขอบการ์ดด้วย `divide-y divide-slate-100`
* **Standard Control Height:**
  * ปุ่มและ Input มาตรฐานใช้ความสูง `h-9 (36px)` โค้งมน `rounded-xl`
  * ปุ่มขนาดเล็กใช้ `h-8 (32px)` โค้งมน `rounded-lg`
  * ช่องกรอกจำนวนเงินใน Modal ใช้ขนาดใหญ่พิเศษ `h-12 (48px) text-2xl` เพื่อให้พิมพ์ตัวเลขได้ง่าย
* **Grid & Container:**
  * Main Container: `max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7`
  * 3 Cards Grid: `grid grid-cols-1 sm:grid-cols-3 gap-4`
  * Dashboard 2 Columns: `grid grid-cols-1 lg:grid-cols-3 gap-6` (2 ส่วนสำหรับรายการ, 1 ส่วนสำหรับสัดส่วนรายจ่าย)

---

## 5. UI Component Architecture (Shadcn/UI & Lucide)

คอมโพเนนต์ทางการของ shadcn ทั้งหมดถูกติดตั้งไว้ใน `src/components/ui/`:

1. **`Sidebar` (`src/components/ui/sidebar.tsx`)**
   - ประกอบด้วย `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarFooter`, `SidebarTrigger`, `SidebarRail`
   - รองรับการย่อ-ขยาย (Collapsible) และ Responsive สลับเป็น Drawer บนมือถืออัตโนมัติ

2. **`Button` (`src/components/ui/button.tsx`)**
   - Base primitive: `@base-ui/react/button`
   - Variants: `default` (Sky Blue), `outline`, `ghost`, `secondary`, `destructive`, `link`
   - Sizes: `default (h-9)`, `sm (h-8)`, `lg (h-10)`, `icon (size-9)`

3. **`Card` (`src/components/ui/card.tsx`)**
   - ประกอบด้วย `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - สไตล์: `rounded-2xl border border-slate-200/90 bg-white shadow-xs` (Single Padding)

4. **`Dialog / Modal` (`src/components/ui/dialog.tsx`)**
   - Base primitive: `@base-ui/react/dialog`
   - ควบคุมการเปิด-ปิดฟอร์มบันทึกรายรับ-รายจ่าย

5. **`Badge` (`src/components/ui/badge.tsx`)**
   - ป้ายกำกับสถานะและประเภทรายรับ-รายจ่าย

6. **`Input` (`src/components/ui/input.tsx`)**
   - Base primitive: `@base-ui/react/input`
   - ขอบสี `border-slate-200` พร้อม Focus ring สีฟ้าอ่อน `focus-visible:border-sky-500`

7. **Icons (`lucide-react`)**
   - ใช้ไอคอนมาตรฐานของ `lucide-react` ทั้งหมด เช่น `LayoutDashboard`, `Store`, `Landmark`, `Wallet`, `Plus`, `Calendar`, `Tag`, `ArrowDownLeft`, `ArrowUpRight`, `RotateCw`, `Search`, `FileSpreadsheet`, `FileText`, `Edit3`

---

## 6. Account Separation Architecture (ระบบแยกบัญชี)

เพื่อความถูกต้องในการทำบัญชีร้านค้า ระบบแบ่งมุมมองออกเป็น 3 แบบผ่าน Sidebar:
1. **📊 ภาพรวมทั้งหมด (`all`):** รวมตัวเลขทั้งร้าน Zonebux และเงินหมุนเวียนทั่วไป
2. **🎮 ร้าน Zonebux (`zonebux`):** แสดงเฉพาะยอดขายจริง ต้นทุน Robux/เหรียญเกม และค่าบริการของร้าน Zonebux
3. **🏦 บัญชีร้านทั่วไป (`general`):** แสดงเงินเติมทุนหมุนเวียน เงินโอนสลับบัญชี และรายรับรายจ่ายที่ไม่เกี่ยวกับยอดขายตรงของร้าน

---

## 7. Dynamic Categories & Custom Note (หมวดหมู่อัจฉริยะและหมายเหตุ)

* **Dynamic Category Mapping:** เมื่อผู้ใช้สลับบัญชี (ร้าน Zonebux vs บัญชีร้านทั่วไป) หมวดหมู่ใน Modal จะเปลี่ยนชุดตัวเลือกให้ตรงตามบริบทของบัญชีนั้นๆ ทันที
* **ตัวเลือก "อื่นๆ (ระบุเอง)":** หากเลือกตัวเลือกนี้ ระบบจะแสดงช่องกรอกข้อความสำหรับพิมพ์ชื่อหมวดหมู่ที่ต้องการได้ทันทีอย่างอิสระ
* **ช่องหมายเหตุ (Note):** แยกออกมาเป็นช่องเต็มความกว้าง (Full-width) ชัดเจน เพื่อให้ระบุรายละเอียด เช่น เลขสลิป, โอนผ่านธนาคารไหน, วัตถุประสงค์การจ่าย

---

## 8. Option 1: Order-level Cost & Diff Profit Tracking (ระบบคำนวณต้นทุนและ Diff กำไรรายออเดอร์)

ระบบออกแบบมาสำหรับธุรกิจจำหน่ายสินค้าดิจิทัลและ Robux ที่มีต้นทุนผันแปรต่อออเดอร์ (เช่น ลูกค้าโอนมา 105 บาท สำหรับ 300 Robux โดยมีต้นทุน Robux ที่ 86 บาท):

### 8.1 Transaction Flow & Live Diff Calculation
* **กรอกราคาขาย (Amount) คู่กับ ต้นทุน (Cost):** ในฟอร์มบันทึกรายการประเภท "รายรับ" ผู้ใช้สามารถกรอกราคาขาย และต้นทุนสินค้าได้พร้อมกันในรายการเดียว
* **Live Diff Calculation Box:** คำนวณกำไรสุทธิและมาร์จิ้นแบบ Real-time ทันทีที่พิมพ์:
  * กำไรสุทธิ (Profit) = $\text{ราคาขาย} - \text{ต้นทุน}$ (เช่น $105 - 86 = +฿19.00$)
  * อัตรากำไร (Margin) = $\frac{\text{กำไร}}{\text{ราคาขาย}} \times 100$ (เช่น 18.1%)
  * แสดง Badge สรุปผลชัดเจน (สีเขียวเมื่อได้กำไร / สีแดงเมื่อขาดทุน)

### 8.2 Dashboard & Transaction List Representation
* **Dashboard Metric Card:** เมื่อมีข้อมูลต้นทุน ระบบจะแสดงการ์ดใบที่ 4 อัตโนมัติ: **"กำไรจากการขาย (Diff Profit)"** พร้อมตัวเลขกำไรสะสมและ % กำไรเฉลี่ย
* **Transaction Row Layout:** ในรายการประวัติ ฝั่งขวาจะแสดงทั้งยอดขายและป้ายกำกับต้นทุน/กำไร:
  * ยอดขายตัวหนา: `+฿105.00`
  * บรรทัดย่อย: `ทุน ฿86.00 • กำไร +฿19.00`
* **Search Filter Integration:** ผู้ใช้สามารถค้นหาจากยอดขาย ต้นทุน หรือกำไรผ่านช่องค้นหาได้โดยตรง

### 8.3 Google Sheet Schema (Columns A-I)
โครงสร้างคอลัมน์ใน Google Sheets สำหรับรองรับ Option 1:
| คอลัมน์ | ชื่อหัวตาราง (Header) | ตัวอย่างข้อมูล | คำอธิบาย |
| :---: | :--- | :--- | :--- |
| **A** | `ID` | `tx_1729...` | รหัสอ้างอิงรายการ |
| **B** | `Date` | `2026-10-24` | วันที่ทำรายการ (YYYY-MM-DD) |
| **C** | `Type` | `รายรับ` / `รายจ่าย` | ประเภทรายการ |
| **D** | `Category` | `ยอดขาย Robux / เหรียญเกม` | หมวดหมู่รายการ |
| **E** | `Amount` | `105` | ราคาขาย / ยอดเงินเข้า-ออก |
| **F** | `Note` | `300 Robux ลูกค้าชื่อ...` | หมายเหตุเพิ่มเติม |
| **G** | `Account` | `ร้าน Zonebux` / `บัญชีร้านทั่วไป` | บัญชีที่เกี่ยวข้อง |
| **H** | `Cost` | `86` | ต้นทุนสินค้า (เฉพาะรายรับที่มีต้นทุน) |
| **I** | `Profit` | `19` | กำไรส่วนต่างสุทธิ (Amount - Cost) |
| **J** | `PaymentMethod` | `บัญชีธนาคาร` / `ทรูมันนี่วอลเล็ท` | ช่องทางรับเงิน |

---

## 9. Payment Methods & Top-up Category Ranking (ช่องทางรับเงินและการจัดอันดับสินค้าที่ลูกค้าเติม)

### 9.1 Payment Methods (ช่องทางรับเงิน)
สำหรับร้าน Zonebux ลูกค้าสามารถชำระเงินได้ 2 ช่องทางหลัก:
1. 🏦 **บัญชีธนาคาร:** โอนผ่านบัญชีธนาคารทั่วไป
2. 📱 **ทรูมันนี่วอลเล็ท:** โอนผ่าน TrueMoney Wallet

ระบบมี Dropdown ให้เลือกใน Modal ทันทีเมื่อเป็นประเภท "รายรับ" และมี Badge กำกับชัดเจนในรายการประวัติธุรกรรม พร้อมรองรับการค้นหา (Search) ตามช่องทางได้ทันที

### 9.2 Top-up Categories & Ranking (หมวดหมู่สินค้าเติมเกมและการจัดอันดับ)
หมวดหมู่สินค้าเฉพาะสำหรับร้าน Zonebux:
* `Robux via ID-Pass` (เติม Robux แบบเข้าไอดี)
* `Robux via Username` (เติม Robux แบบไม่ต้องใช้รหัสผ่าน)
* `Gamepass` (ซื้อเกมพาส)
* `ยอดขายไอดีเกม`
* `ค่าบริการ / เติมเกมอื่นๆ`
* `อื่นๆ (ระบุเอง)`

คอมโพเนนต์ **จัดอันดับสินค้าที่ลูกค้าเติม ([CategoryBreakdown.tsx](file:///Users/inkgrix/zonebux-In-out/src/components/CategoryBreakdown.tsx))** จะรวบรวมยอดขายและจำนวนบิล (ออเดอร์) มาเรียงอันดับความนิยม #1, #2, #3 พร้อมสัดส่วน % ให้เห็นภาพชัดเจนว่าสินค้าตัวไหนขายดีที่สุด

