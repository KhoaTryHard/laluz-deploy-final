"use client";

import { useEffect } from "react";
import "./admin.css"; // CSS admin riêng (tạo ở bước 2)

export default function AdminLayout({ children }) {
  useEffect(() => {
    const btnHam = document.querySelector(".btn-ham");
    const menuMb = document.querySelector(".menu-mb");
    const overlay = document.querySelector(".overlay");

    if (!btnHam || !menuMb || !overlay) return;

    const toggle = () => {
      btnHam.classList.toggle("active-btn-ham");
      menuMb.classList.toggle("active-mn-mb");
      overlay.classList.toggle("active-overlay");
    };

    btnHam.addEventListener("click", toggle);
    overlay.addEventListener("click", toggle);

    return () => {
      btnHam.removeEventListener("click", toggle);
      overlay.removeEventListener("click", toggle);
    };
  }, []);

  return (
    <>
      {/* HEADER ADMIN */}
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div className="admin-logo">ADMIN PANEL</div>
            <div className="btn-ham">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="menu-mb">
        <nav>
          <a href="/admin">Dashboard</a>
          <a href="/admin/products">Sản phẩm</a>
          <a href="/admin/orders">Đơn hàng</a>
          <a href="/admin/users">Người dùng</a>
        </nav>
      </aside>

      <div className="overlay"></div>

      {/* MAIN */}
      <main className="admin-main">{children}</main>
    </>
  );
}
