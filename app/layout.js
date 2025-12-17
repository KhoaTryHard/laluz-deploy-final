import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // ✅ chỉ reset nhẹ, dùng chung cho toàn app

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LALUZ PARFUMS",
  description: "Cửa hàng nước hoa Laluz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
