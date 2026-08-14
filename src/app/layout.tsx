import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Makhzon — نظام الإجراءات والمشاكل",
  description: "Operational knowledge base for SOP and daily issues",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cairo.className} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
