"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (localCart.length > 0) {
        // Gửi giỏ hàng local lên server để merge
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localItems: localCart.map((i) => ({
              product_id: i.id || i.product_id,
              quantity: i.quantity,
            })),
          }),
        });

        // Sau khi sync xong thì xóa local để tránh trùng lặp,
        // từ giờ sẽ dùng giỏ hàng từ DB
        localStorage.removeItem("cart");
      }

      window.dispatchEvent(new Event("auth-change"));

      const userRole = data.user.role;

      if (userRole === "admin") {
        // 🔐 LƯU ADMIN ĐANG ĐĂNG NHẬP
        localStorage.setItem(
          "admin_user",
          JSON.stringify({
            user_id: data.user.user_id,
            email: data.user.email,
            role: data.user.role,
          })
        );

        alert("Xin chào Admin! Đang vào trang quản trị...");
        router.push("/admin");
      } else {
        alert("Đăng nhập thành công!");
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-hd">
        <p className="tt-sec">ĐĂNG NHẬP</p>
      </div>

      <form className="box-form" onSubmit={handleSubmit}>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <div className="group-form">
          <label className="txt">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email..."
            required
            onChange={handleChange}
          />
        </div>

        <div className="group-form">
          <label className="txt">Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu..."
            required
            onChange={handleChange}
          />
        </div>

        <div className="group-sup">
          <a className="txt sign-up" href="/register">
            Chưa có tài khoản? Đăng ký tại đây
          </a>
        </div>

        <button className="btn btn-pri" disabled={loading}>
          <span className="txt">{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
        </button>
      </form>
    </div>
  );
}
