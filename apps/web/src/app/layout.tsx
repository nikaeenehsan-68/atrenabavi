import "@fontsource/vazirmatn";   // فونت را از node_modules لود کن
import "./globals.css";

export const metadata = {
  title: "پنل مدیریت عطر نبوی",
  description: "سیستم مدیریت مدرسه",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazirmatn bg-gray-50">{children}</body>
    </html>
  );
}
