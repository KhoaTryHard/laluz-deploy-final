"use client";

import Link from "next/link";
<<<<<<< HEAD
import { usePathname } from "next/navigation";
import { adminProducts } from "@/data/admin-products"; // ✅ thêm dòng này

/* helper: "3.450.000đ" -> 3450000 */
const parsePrice = (price) => Number(String(price).replace(/\D/g, "") || 0);
const getCategory = (name) => {
  const n = String(name).toLowerCase();
  if (n.includes("dior") || n.includes("mancera") || n.includes("gaultier"))
    return "Nam";
  if (n.includes("gucci") || n.includes("chanel")) return "Nữ";
  return "Unisex";
};

export default function AdminSidebar() {
  const pathname = usePathname();
=======
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
>>>>>>> 2712

  const menu = [
    { label: "Dashboard", href: "/admin", exact: true },
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: "Quản lý đơn hàng", href: "/admin/orders" },
    { label: "Quản lý người dùng", href: "/admin/users" },
<<<<<<< HEAD
    { label: "Đăng xuất", href: "/logout" },
=======
>>>>>>> 2712
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

<<<<<<< HEAD
  // ✅ giờ adminProducts/parsePrice/getCategory đều đã tồn tại
  const revenueByCategory = { Nam: 0, Nữ: 0, Unisex: 0 };
  adminProducts.forEach((p) => {
    const category = getCategory(p.name);
    revenueByCategory[category] += parsePrice(p.price) * p.stock;
  });
=======
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
>>>>>>> 2712

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-title">ADMIN PANEL</div>

      <ul className="admin-menu">
        {menu.map((item) => (
          <li key={item.href} className={isActive(item) ? "active" : ""}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
<<<<<<< HEAD
=======

        {/* ✅ LOGOUT KHÔNG DÙNG LINK */}
        <li>
          <button onClick={handleLogout} className="admin-logout-btn">
            Đăng xuất
          </button>
        </li>
>>>>>>> 2712
      </ul>
    </aside>
  );
}
