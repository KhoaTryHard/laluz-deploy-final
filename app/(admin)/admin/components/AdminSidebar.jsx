"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    { label: "Dashboard", href: "/admin", exact: true },
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: "Quản lý đơn hàng", href: "/admin/orders" },
    { label: "Quản lý người dùng", href: "/admin/users" },
    { label: "Đăng xuất", href: "/logout" },
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
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
      </ul>
    </aside>
  );
}
