"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserForm({ user = {}, mode }) {
  const router = useRouter();
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "admin");
  const [status, setStatus] = useState(user.status || "active");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email và mật khẩu là bắt buộc");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text);
      return;
    }

    alert("Tạo admin thành công");
    router.push("/admin/users");
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Nhập mật khẩu admin"
        />
      </div>

      <div className="form-group">
        <label>Vai trò</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          {/* <option value="super_admin">Super Admin</option> */}
        </select>
      </div>

      <div className="form-group">
        <label>Trạng thái</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Hoạt động</option>
          <option value="blocked">Khoá</option>
        </select>
      </div>

      <div className="form-actions">
        <button className="btn btn-pri">Lưu</button>
        <button
          type="button"
          className="btn btn-four"
          onClick={() => router.back()}
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
