"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChangePasswordPage() {
  const { id } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");

  // ✅ Guard frontend: chỉ chính mình
  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");

    if (!adminUser) {
      router.replace("/admin/login");
      return;
    }

    if (String(adminUser.user_id) !== String(id)) {
      alert("Bạn không có quyền đổi mật khẩu tài khoản này");
      router.replace("/admin/users");
    }
  }, [id, router]);

  // 🔥 👉 HÀM GỌI API ĐỔI MẬT (CHỈ ĐẶT Ở ĐÂY)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");
    if (!adminUser) return;

    const res = await fetch(`/api/admin/users/${id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newPassword: password,
        currentUserId: adminUser.user_id,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || "Đổi mật khẩu thất bại");
      return;
    }

    alert("Đổi mật khẩu thành công");
    router.push("/admin/users");
  };

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">Đổi mật khẩu</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-pri">Cập nhật</button>
        </div>
      </form>
    </div>
  );
}
