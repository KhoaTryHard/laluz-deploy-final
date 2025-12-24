"use client";

import { useState, useEffect } from "react";
import AccountSidebarMenu from "./AccountSidebarMenu"; // Đảm bảo bạn đã có file này cùng thư mục

export default function AccountSidebar() {
  const [avatar, setAvatar] = useState("/template/assets/images/default-mona.png");
  // 1. Tạo state để lưu thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "..."
  });

  // 2. Dùng useEffect để gọi API lấy dữ liệu khi trang vừa load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Gọi API mà bạn đã tạo ở bước trước (app/api/auth/me/route.js)
        const res = await fetch("/api/auth/me"); 
        
        if (res.ok) {
          const data = await res.json();
          // Cập nhật state với dữ liệu thật từ SQL
          setUserInfo({
            name: data.full_name || data.name || "Khách hàng", // Ưu tiên full_name từ DB
            email: data.email
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="info-acount-col-left col col-md-3 col-12">
      <div className="inner">
        <div className="info-acount-col-left-hd">
          <label className="ava-label">
            <div className="preview-img">
              <span className="button-upload">
                <img src="/images/ic-user.svg" className="fileImg img-src" alt="Avatar" />
              </span>
            </div>
          </label>

          {/* 3. Hiển thị biến userInfo thay vì chữ cứng */}
          <div style={{ marginTop: '10px' }}>
            <p className="name" style={{ fontWeight: 'bold' }}>{userInfo.name}</p>
          </div>
        </div>

        {/* Nhúng Menu vào đây cho gọn */}
        <AccountSidebarMenu />
      </div>
    </div>
  );
}