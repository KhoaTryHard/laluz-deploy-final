<<<<<<< HEAD
// import AccountBreadcrumb from "@/components/Account/AccountBreadcrumb";s
=======
"use client";

import { useState } from "react";
import Breadcrumb from "@/components/UI/Breadcrumb";
>>>>>>> 2712
import AccountSidebar from "@/components/Account/AccountSidebar";

export default function ChangePasswordPage() {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // State lưu thông báo và trạng thái tải
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" }); // Reset thông báo cũ
    setLoading(true);

    // Validate phía Client trước
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Mật khẩu xác nhận không khớp!" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }

      // Thành công
      setStatus({ type: "success", message: "Đổi mật khẩu thành công!" });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Xóa form

    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tài khoản", href: "/account" },
          { label: "Đổi mật khẩu", active: true }
        ]}
      />

      <section className="info-acount">
        <div className="container">
          <div className="info-acount-flex row">
            
            {/* Sidebar Trái */}
            <AccountSidebar />

            {/* Nội dung Phải */}
            <div className="info-acount-col-right col col-md-9">
              <div className="woocommerce">
                <div className="woocommerce-MyAccount-content">
                  
                  <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase'}}>
                    Đổi mật khẩu
                  </h2>

                  <form className="is-loading-group" onSubmit={handleSubmit}>
                    
                    {/* Hiển thị thông báo Lỗi hoặc Thành công */}
                    {status.message && (
                      <div style={{
                        padding: '12px', 
                        marginBottom: '20px', 
                        borderRadius: '4px',
                        backgroundColor: status.type === 'error' ? '#fde8e8' : '#def7ec',
                        color: status.type === 'error' ? '#c81e1e' : '#03543f',
                        border: `1px solid ${status.type === 'error' ? '#f8b4b4' : '#84e1bc'}`
                      }}>
                        {status.type === 'error' ? '⚠️ ' : '✅ '} {status.message}
                      </div>
                    )}

                    <div className="group-form">
                      <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Mật khẩu cũ</label>
                      <input 
                        type="password" 
                        name="oldPassword"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                        value={formData.oldPassword}
                        onChange={handleChange}
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>

                    <div className="group-form">
                      <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Mật khẩu mới</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        placeholder="Nhập mật khẩu mới"
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>

                    <div className="group-form">
                      <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Nhập lại mật khẩu mới</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>

                    <button className="btn btn-pri" disabled={loading} style={{marginTop: '10px'}}>
                      <span className="txt">
                        {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                      </span>
                    </button>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}