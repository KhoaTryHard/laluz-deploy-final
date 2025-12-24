"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { label: "Dashboard", href: "/admin", exact: true },
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: "Quản lý đơn hàng", href: "/admin/orders" },
    { label: "Quản lý người dùng", href: "/admin/users" },
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // ✅ HÀM LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("admin_user"); // xoá session admin
    router.push("/"); // về trang chủ
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-title">ADMIN PANEL</div>

      <ul className="admin-menu">
        {menu.map((item) => (
          <li key={item.href} className={isActive(item) ? "active" : ""}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}

        {/* ✅ LOGOUT KHÔNG DÙNG LINK */}
        <li>
          <button onClick={handleLogout} className="admin-logout-btn">
            Đăng xuất
          </button>
        </li>
      </ul>
    </aside>
  );
}
