"use client";

import { useState } from "react";
import { adminProducts } from "@/data/admin-products";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    status: "active",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===== IMAGE UPLOAD (MOCK) ===== */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
  };

  /* ===== VALIDATE ===== */
  const validate = () => {
    const err = {};
    if (!form.name) err.name = "Vui lòng nhập tên sản phẩm";
    if (!form.price || isNaN(form.price)) err.price = "Giá phải là số";
    if (!form.stock || form.stock < 0) err.stock = "Số lượng không hợp lệ";
    if (images.length === 0) err.images = "Vui lòng chọn ít nhất 1 ảnh";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    adminProducts.push({
      id: Date.now(),
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
      images,
    });

    alert("Thêm sản phẩm thành công (mock)");
  };

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">THÊM SẢN PHẨM MỚI</h2>

      <form className="admin-form box-white" onSubmit={handleSubmit}>
        {/* TÊN */}
        <div className="form-group">
          <label>Tên sản phẩm *</label>
          <input name="name" onChange={handleChange} />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* GIÁ */}
        <div className="form-group">
          <label>Giá bán *</label>
          <input name="price" onChange={handleChange} />
          {errors.price && <p className="form-error">{errors.price}</p>}
        </div>

        {/* TỒN */}
        <div className="form-group">
          <label>Số lượng tồn *</label>
          <input type="number" name="stock" onChange={handleChange} />
          {errors.stock && <p className="form-error">{errors.stock}</p>}
        </div>

        {/* TRẠNG THÁI */}
        <div className="form-group">
          <label>Trạng thái</label>
          <select name="status" onChange={handleChange}>
            <option value="active">Đang bán</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        {/* ẢNH */}
        <div className="form-group">
          <label>Ảnh sản phẩm *</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
          />
          {errors.images && <p className="form-error">{errors.images}</p>}

          <div className="preview-images">
            {images.map((img, i) => (
              <img key={i} src={img} alt="" />
            ))}
          </div>
        </div>

        {/* ACTION */}
        <div className="form-actions">
          <button className="btn btn-pri">Lưu sản phẩm</button>
          <a href="/admin/products" className="btn btn-four">
            Hủy
          </a>
        </div>
      </form>
    </div>
  );
}
