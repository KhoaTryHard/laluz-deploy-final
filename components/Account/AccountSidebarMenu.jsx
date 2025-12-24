"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AccountSidebarMenu() {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để active menu
  const router = useRouter();

  // Xử lý đăng xuất
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
      router.refresh(); 
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <div className="info-acount-col-left-bd">
      {/* Link 1: Thông tin tài khoản */}
      <Link 
        className={`link ${pathname === "/account" ? "active" : ""}`} 
        href="/account"
      >
        <span className="txt">Thông tin tài khoản</span>
      </Link>

      {/* Link 2: Lịch sử đơn hàng */}
      <Link 
        className={`link ${pathname === "/account/orders" ? "active" : ""}`} 
        href="/account/orders"
      >
        <span className="txt">Lịch sử đơn hàng</span>
      </Link>

      {/* Link 3: Đổi mật khẩu */}
      <Link 
        className={`link ${pathname === "/account/change-password" ? "active" : ""}`} 
        href="/account/change-password"
      >
        <span className="txt">Thay đổi mật khẩu</span>
      </Link>

      {/* Nút Đăng xuất (Thêm mới) */}
      <a 
        className="link" 
        href="#" 
        onClick={handleLogout}
        style={{ borderTop: "1px solid #eee", marginTop: "10px", paddingTop: "10px" }}
      >
        <span className="txt" style={{ color: "#d33" }}>Đăng xuất</span>
      </a>
    </div>
  );
}