"use client"; // Bắt buộc để dùng State và Router

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  
  // State lưu dữ liệu nhập vào
  const [formData, setFormData] = useState({
    register_email: "",
    register_pass: "",
    register_repass: ""
  });
  
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút Đăng ký
  const handleRegister = async (e) => {
    // Ngăn hành vi reload mặc định của form/button
    e.preventDefault(); 
    
    // 1. Validate mật khẩu nhập lại
    if (formData.register_pass !== formData.register_repass) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);

    try {
      // 2. Gọi API đăng ký
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.register_email,
          password: formData.register_pass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // 3. Thành công: Chuyển hướng sang trang user
      // Lưu ý: data.username chính là phần trước @ của email do API trả về
      alert(`Đăng ký thành công! Xin chào ${data.username}`);
      router.push("/account"); // Chuyển hướng

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-hd">
        <p className="tt-sec">Đăng kí tài khoản</p>
      </div>

      {/* Thêm onKeyPress để bấm Enter cũng đăng ký được */}
      <div className="box-form">
        <div className="group-form">
          <label className="txt">Email</label>
          <input
            type="email"
            name="register_email"
            placeholder="Email"
            required
            // 👇 THÊM LOGIC
            value={formData.register_email}
            onChange={handleChange}
          />
        </div>

        <div className="group-form">
          <label className="txt">Mật khẩu</label>
          <input
            type="password"
            name="register_pass"
            placeholder="Mật khẩu"
            required
            // 👇 THÊM LOGIC
            value={formData.register_pass}
            onChange={handleChange}
          />
        </div>

        <div className="group-form">
          <label className="txt">Nhập lại mật khẩu</label>
          <input
            type="password"
            name="register_repass"
            placeholder="Nhập lại mật khẩu"
            required
            // 👇 THÊM LOGIC
            value={formData.register_repass}
            onChange={handleChange}
          />
        </div>

        <div className="group-sup">
          <a className="txt sign-up" href="/login">
            Bạn đã có tài khoản? Đăng nhập tại đây
          </a>
        </div>

        <button 
          className="btn btn-pri" 
          type="submit"
          // 👇 THÊM LOGIC
          onClick={handleRegister}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }} // Hiệu ứng mờ khi đang tải
        >
          <span className="txt">
            {loading ? "Đang xử lý..." : "Đăng kí"}
          </span>
        </button>
      </div>
    </div>
  );
}