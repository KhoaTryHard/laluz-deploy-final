"use client";

import { useEffect } from "react";
// Import Component bảo vệ
import AdminGuard from "@/components/Admin/AdminGuard";
import "./admin.css";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminSidebar from "../admin/components/AdminSidebar";

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

  // Hàm xử lý đăng xuất: Xóa localStorage rồi mới chuyển trang
  const handleLogout = () => {
    localStorage.removeItem("admin_user");
  };

  return (
    // [QUAN TRỌNG] Bọc toàn bộ giao diện trong AdminGuard
    <AdminGuard>
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="hd-mid">
              <div className="hd-mid-inner">
                <div className="logo">
                  <span className="tt-sec">ADMIN PANEL</span>
                </div>

                <div className="hd-mid-right">
                  <div className="hd-mid-right-it">
                    <div className="btn-ham-wr">
                      <div className="btn-ham">
                        <span className="line-ham"></span>
                        <span className="line-ham"></span>
                        <span className="line-ham"></span>
                      </div>
                    </div>
                    <a
                      href="/admin/login"
                      className="hd-login"
                      onClick={handleLogout}
                    >
                      <div className="ic-login">
                        <i className="fas fa-user-circle fa-2x"></i>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="admin-body">
        {/* ===== SIDEBAR ===== */}
        <AdminSidebar />

        <div className="overlay"></div>

        {/* ===== MAIN ===== */}
        <main className="main spc-hd main-default-page">{children}</main>
      </div>
    </AdminGuard>
  );
}
