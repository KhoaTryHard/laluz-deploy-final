"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProductForm({ product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Khởi tạo state từ dữ liệu product truyền vào
  const [formData, setFormData] = useState({
    name: product.name || "",
    price: product.price || 0,
    stock_quantity: product.stock_quantity || 0,
    // Status chỉ là hiển thị logic, database không có cột này nên ta tự tính
    status: product.stock_quantity > 0 ? "active" : "out",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price), // Chuyển đổi sang số
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật");

      alert("Cập nhật thành công!");
      router.refresh(); // Làm mới dữ liệu
      router.push("/admin/products"); // Quay về danh sách
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-white">
      <form className="form-admin" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Giá bán (VNĐ)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Số lượng tồn</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Trạng thái (Tự động theo kho)</label>
          <select
            name="status"
            value={formData.stock_quantity > 0 ? "active" : "out"}
            disabled // Disable vì trạng thái phụ thuộc vào số lượng
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <option value="active">Đang bán</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button className="btn btn-pri" disabled={loading}>
            {loading ? "Đang lưu..." : "Cập nhật"}
          </button>
          <a
            href="/admin/products"
            className="btn btn-four"
            style={{ marginLeft: "1rem" }}
          >
            Quay lại
          </a>
        </div>
      </form>
    </div>
  );
}