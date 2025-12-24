// components/Admin/AdminGuard.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // [!code highlight] Thêm usePathname

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // [!code highlight] Lấy đường dẫn hiện tại
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Nếu đang ở trang Login thì cho qua luôn, không cần check
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }

    // 2. Các trang khác thì mới check localStorage
    const user = localStorage.getItem("admin_user");

    if (!user) {
      // Chưa đăng nhập -> Đá về Login
      router.push("/login");
      setAuthorized(false);
    } else {
      // Đã đăng nhập -> Cho phép vào
      setAuthorized(true);
    }
  }, [router, pathname]);

  // Màn hình chờ
  if (!authorized) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div className="spinner" style={{marginBottom: '10px'}}></div> {/* Nếu có CSS spinner */}
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <>{children}</>;
}