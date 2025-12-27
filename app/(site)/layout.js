/* ===== CSS SITE ===== */
import "./css/style.css";
import "./css/theme-fixed.css";
import "./css/swiper-bundle.min.css";
import "./css/fancybox.css";
import "./css/lightgallery.min.css";
import "./css/aos.css";
import "./css/mona-custom.css";
import "./css/about.css";
import "./css/react-layout-fix.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Header from "@/components/Header";
import Footer from "@/components/UI/Footer/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "LALUZ PARFUMS",
  description: "Cửa hàng nước hoa Laluz",
};

export default function SiteLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
