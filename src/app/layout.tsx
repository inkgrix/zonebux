import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const lineSeedSans = localFont({
  src: [
    {
      path: "../../public/font/LINESeedSansTH_W_Th.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/LINESeedSansTH_W_Rg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/LINESeedSansTH_W_Bd.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/font/LINESeedSansTH_W_XBd.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/font/LINESeedSansTH_W_He.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-line-seed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZoneBux | บันทึกรายรับ-รายจ่าย",
  description:
    "เว็บแอปพลิเคชันบันทึกรายรับ-รายจ่ายส่วนตัว ใช้งานง่าย สไตล์คลีน จัดเก็บข้อมูลบน Google Sheet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${lineSeedSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
