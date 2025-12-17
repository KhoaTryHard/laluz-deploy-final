import { Geist, Geist_Mono } from "next/font/google";

/* ========== 1. WP CORE ========== */
import "./css/style.css";
import "./css/theme-fixed.css";

/* ========== 2. PLUGINS ========== */
import "./css/swiper-bundle.min.css";
import "./css/fancybox.css";
import "./css/lightgallery.min.css";
import "./css/aos.css";

/* ========== 3. THEME CUSTOM ========== */
import "./css/mona-custom.css";
import "./css/about.css";

/* ========== 4. REACT / NEXT FIX (LUÔN SAU CÙNG) ========== */
import "./css/react-layout-fix.css";
import "./globals.css"; // chỉ reset nhẹ

import Header from "@/components/Header";
import Footer from "@/components/UI/Footer/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
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
        <Header />

        <>{children}</>

        <Footer />
      </body>
    </html>
  );
}
