"use client";

import { useState, useEffect } from "react";
// Đã xóa import updateProfile cũ vì chúng ta dùng API trực tiếp

export default function AccountProfileForm() {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          // Cập nhật state với dữ liệu từ SQL
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            birthday: data.birthday || ""
          });
        }
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Xử lý khi người dùng nhập liệu (Two-way binding)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý lưu (Gửi PUT request)
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Cập nhật thành công!");
        // Có thể reload trang hoặc trigger cập nhật sidebar tại đây nếu cần
        window.location.reload(); 
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server.");
    } finally {
      setSaving(false);
    }
  }

  // Nếu đang tải dữ liệu lần đầu, có thể hiện loading hoặc để form trống
  // Ở đây mình để form hiển thị luôn để giữ layout, dữ liệu sẽ tự điền vào sau 1 xíu
  
  return (
    <form
      className="is-loading-group"
      id="m-edit-account"
      onSubmit={handleSubmit}
    >
      <div className="form-info-acount row">
        
        {/* HỌ VÀ TÊN */}
        <div className="group-form col col-md-6">
          <label className="name-group">Họ và Tên</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder={loading ? "Đang tải..." : "Nhập họ tên"}
            required
          />
        </div>

        {/* EMAIL (Read only) */}
        <div className="group-form col col-md-6">
          <label className="name-group">Email</label>
          <input 
            value={formData.email} 
            readOnly 
            style={{ backgroundColor: "#f5f5f5", color: "#888" }} // Style nhẹ để báo hiệu không sửa được
          />
        </div>

        {/* NGÀY SINH */}
        <div className="group-form col col-md-6">
          <label className="name-group">Ngày sinh</label>
          <input 
            name="birthday" 
            type="date" 
            className="date"
            value={formData.birthday} 
            onChange={handleChange}
          />
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div className="group-form col col-md-6">
          <label className="name-group">Số Điện thoại</label>
          <input 
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>

      <button className="btn btn-pri" disabled={saving}>
        <span className="txt">
          {saving ? "Đang lưu..." : "Thay đổi"}
        </span>
      </button>
    </form>
  );
}