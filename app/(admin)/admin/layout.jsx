
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
      {/* BODY */}
      <div className="admin-layout">
        {/* ===== SIDEBAR ===== */}
        <AdminSidebar />

        <div className="overlay"></div>

        {/* ===== MAIN ===== */}
        <main className="admin-content">{children}</main>
      </div>
    </AdminGuard>
>>>>>>> 2712
  );
}
