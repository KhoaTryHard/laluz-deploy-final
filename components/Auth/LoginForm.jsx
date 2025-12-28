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

  const LOCAL_CART_KEY = "laluz_cart";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. LOGIN
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // 2. AUTO SYNC CART
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      const localCart = raw ? JSON.parse(raw) : [];

      const validItems = Array.isArray(localCart)
        ? localCart.filter(
            (i) => i && (i.product_id || i.id) && typeof i.quantity === "number"
          )
        : [];

      if (validItems.length > 0) {
        const syncRes = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔥 BẮT BUỘC
          body: JSON.stringify({
            localItems: validItems.map((i) => ({
              product_id: i.product_id || i.id,
              quantity: i.quantity,
            })),
          }),
        });

        if (syncRes.ok) {
          localStorage.removeItem(LOCAL_CART_KEY);
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          console.error("❌ Sync cart failed");
        }
      }

      // 3. REDIRECT
      const userRole = data.user.role;

      if (userRole === "admin") {
        localStorage.setItem(
          "admin_user",
          JSON.stringify({
            user_id: data.user.user_id,
            email: data.user.email,
            role: data.user.role,
          })
        );
        router.push("/admin");
      } else {
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

        <button
          className="btn btn-pri"
          disabled={loading}
          onClick={() => {
            router.refresh();
          }}
        >
          <span className="txt">{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
        </button>
      </form>
    </div>
  );
}
