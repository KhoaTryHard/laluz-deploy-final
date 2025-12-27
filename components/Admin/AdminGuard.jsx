// components/Admin/AdminGuard.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // [!code highlight] Thêm usePathname

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // [!code highlight] Lấy đường dẫn hiện tại
  const [authorized, setAuthorized] = useState("checking");

  useEffect(() => {
  if (pathname === "/login") {
    setAuthorized(true);
    return;
  }

  const raw = localStorage.getItem("admin_user");

  if (!raw) {
    router.push("/login");
    setAuthorized(false);
    return;
  }

  try {
    const user = JSON.parse(raw);

    if (user.role !== "admin") {
      router.push("/login");
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  } catch (error) {
    console.error("AdminGuard parse error:", error);
    router.push("/login");
    setAuthorized(false);
  }
}, [router, pathname]);

  // Màn hình chờ
  if (!authorized) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div className="spinner" style={{ marginBottom: "10px" }}></div>{" "}
        {/* Nếu có CSS spinner */}
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <>{children}</>;
}
