import { Cairo, Tajawal, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], weight: ["600", "800"] });
const tajawal = Tajawal({ variable: "--font-tajawal", subsets: ["arabic", "latin"], weight: ["400", "500", "700"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["500"] });

export const metadata = {
  title: "شركة قمة الحضارة للمقاولات",
  description: "بوابة إدارة المشروعات — شركة قمة الحضارة للمقاولات",
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-100 text-stone-900" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
