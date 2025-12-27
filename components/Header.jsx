"use client";

import { useEffect, useState } from "react";
import HeaderTop from "./HeaderTop";
import HeaderMid from "./HeaderMid";
import HeaderBottom from "./HeaderBottom";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
  const updateHeaderHeight = () => {
    const header = document.querySelector("header.header");
    if (!header) return;

    const height = header.offsetHeight;
    document.documentElement.style.setProperty(
      "--header-current-height",
      `${height}px`
    );
  };

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scroll = window.scrollY > 120;

        setIsScroll(scroll);
        document.body.classList.toggle("header-scroll", scroll);

        updateHeaderHeight();

        ticking = false;
      });
      ticking = true;
    }
  };

  // init lần đầu
  updateHeaderHeight();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateHeaderHeight);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", updateHeaderHeight);
  };
}, []);




  return (
    <header className={`header hd-repon ${isScroll ? "is-scroll" : ""}`}>
      <div className="header-inner">
        <HeaderTop />
        <HeaderMid />
        <HeaderBottom />
      </div>
    <MobileMenu />
    </header>
  );
}
