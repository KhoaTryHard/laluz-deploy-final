"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditProductForm({ product }) {
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    }

    if (Number(formData.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0";
    }

    if (Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = "Số lượng tồn không được nhỏ hơn 0";
    }

    if (!formData.brand_id) {
      newErrors.brand_id = "Vui lòng chọn thương hiệu";
    }

    if (formData.volume_ml && Number(formData.volume_ml) <= 0) {
      newErrors.volume_ml = "Dung tích phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [newBrand, setNewBrand] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const handleAddBrand = async () => {
    if (!newBrand.trim()) {
      alert("Vui lòng nhập tên thương hiệu");
      return;
    }

    setAddingBrand(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrand }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // reload brand list
      const brandRes = await fetch("/api/admin/brands");
      const brandList = await brandRes.json();
      setBrands(brandList);

      // auto select brand mới
      setFormData((prev) => ({
        ...prev,
        brand_id: data.brand_id,
      }));

      setNewBrand("");
    } catch (err) {
      alert("Lỗi thêm thương hiệu: " + err.message);
    } finally {
      setAddingBrand(false);
    }
  };

  const [brands, setBrands] = useState([]);
  useEffect(() => {
    fetch("/api/admin/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(() => setBrands([]));
  }, []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product.name || "",
    price: product.price || 0,
    stock_quantity: product.stock_quantity || 0,
    description: product.description || "",
    brand_id: product.brand_id || "",
    volume_ml: product.volume_ml || "",
    image_urls: product.image_urls || "",
    top_notes: product.top_notes || "",
    middle_notes: product.middle_notes || "",
    base_notes: product.base_notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // VALIDATE FRONTEND
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock_quantity: Number(formData.stock_quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi cập nhật");

      alert("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-admin box-white" onSubmit={handleSubmit}>
      <h3 className="tt-sec">Thông tin sản phẩm</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Giá bán (VNĐ)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
          {errors.price && <p className="error-text">{errors.price}</p>}
        </div>

        <div className="form-group">
          <label>Số lượng tồn</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
          />
          {errors.stock_quantity && (
            <p className="error-text">{errors.stock_quantity}</p>
          )}
        </div>

        <div className="form-group">
          <label>Dung tích (ml)</label>
          <input
            name="volume_ml"
            value={formData.volume_ml}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Thương hiệu</label>

          <select
            name="brand_id"
            value={formData.brand_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Thêm brand mới */}
          <div className="brand-add-row">
            <input
              type="text"
              placeholder="Nhập thương hiệu mới nếu chưa có"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-four"
              onClick={handleAddBrand}
              disabled={addingBrand}
            >
              {addingBrand ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
          {errors.brand_id && <p className="error-text">{errors.brand_id}</p>}
        </div>
      </div>

      <div className="form-group">
        <label>Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Danh sách ảnh (phân cách bằng dấu phẩy)</label>
        <textarea
          name="image_urls"
          value={formData.image_urls}
          onChange={handleChange}
        />
      </div>

      <h4 className="tt-bl">Hương thơm</h4>

      <div className="form-grid">
        <div className="form-group">
          <label>Hương đầu</label>
          <input
            name="top_notes"
            value={formData.top_notes}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Hương giữa</label>
          <input
            name="middle_notes"
            value={formData.middle_notes}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Hương cuối</label>
          <input
            name="base_notes"
            value={formData.base_notes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-second" disabled={loading}>
          {loading ? "Đang lưu..." : "Cập nhật"}
        </button>

        <a href="/admin/products" className="btn btn-four">
          Quay lại
        </a>
      </div>
    </form>
  );
}
