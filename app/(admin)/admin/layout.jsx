"use client";

import { useEffect } from "react";
// Import Component bảo vệ
import AdminGuard from "@/components/Admin/AdminGuard"; 
import "./admin.css";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
                    <a href="/admin/login" className="hd-login" onClick={handleLogout}>
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

      {/* ===== SIDEBAR ===== */}
      <div className="menu-mb">
        <div className="menu-mb-action">
          <nav className="nav-menu">
            <ul className="menu-list flex-col-mn">
              <li className="menu-item">
                <a href="/admin" className="menu-link txt-mn">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </a>
              </li>
              <li className="menu-item">
                <a href="/admin/products" className="menu-link txt-mn">
                  <i className="fas fa-box"></i> Quản lý Sản phẩm
                </a>
              </li>
              <li className="menu-item">
                <a href="/admin/orders" className="menu-link txt-mn">
                  <i className="fas fa-shopping-cart"></i> Quản lý Đơn hàng
                </a>
              </li>
              <li className="menu-item">
                <a href="/admin/users" className="menu-link txt-mn">
                  <i className="fas fa-users"></i> Quản lý Người dùng
                </a>
              </li>
              <li className="menu-item">
                {/* Thêm sự kiện onClick để xóa dữ liệu khi đăng xuất */}
                <a href="/admin/login" className="menu-link txt-mn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Đăng xuất
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="overlay"></div>

      {/* ===== MAIN ===== */}
      <main className="main spc-hd main-default-page">{children}</main>
    </AdminGuard>
  );
}