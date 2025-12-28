"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);

  // State logic brand
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // State dữ liệu
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    price: "",
    volume_ml: 100,
    stock_quantity: 10,
    description: "",
    image_urls: "",
    top_notes: "",
    middle_notes: "",
    base_notes: "",
  });

  // State lỗi (Validation)
  const [errors, setErrors] = useState({});

  // Lấy danh sách Brand
  useEffect(() => {
    fetch("/api/admin/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        // // Nếu có brand thì default chọn cái đầu tiên
        // if (data.length > 0 && !formData.brand_id) {
        //     setFormData(prev => ({ ...prev, brand_id: data[0].brand_id }));
        // }
      })
      .catch((err) => console.error("Lỗi lấy brand:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Hàm kiểm tra lỗi (Validate) giống mẫu
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";

    if (!formData.price) {
      newErrors.price = "Vui lòng nhập giá bán";
    } else if (Number(formData.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0";
    }

    if (!isNewBrand && !formData.brand_id) {
      newErrors.brand = "Vui lòng chọn thương hiệu";
    }
    if (isNewBrand && !newBrandName.trim()) {
      newErrors.brand = "Vui lòng nhập tên thương hiệu mới";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Chặn nếu có lỗi

    setLoading(true);

    const payload = {
      ...formData,
      is_new_brand: isNewBrand,
      new_brand_name: newBrandName,
    };

    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi thêm");
      }

      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">THÊM SẢN PHẨM MỚI</h2>

      {/* Sử dụng class admin-form giống mẫu */}
      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Hàng 1: Tên sản phẩm */}
        <div className="form-group">
          <label>Tên sản phẩm *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Dior Sauvage"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Hàng 2: Thương hiệu (Logic phức tạp nhưng giao diện sạch) */}
        <div className="form-group">
          <label>Thương hiệu *</label>
          <div className="d-flex gap-2">
            {!isNewBrand ? (
              <select
                name="brand_id"
                className="form-control flex-grow-1"
                onChange={handleChange}
                value={formData.brand_id}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-control flex-grow-1"
                placeholder="Nhập tên thương hiệu mới..."
                value={newBrandName}
                onChange={(e) => {
                  setNewBrandName(e.target.value);
                  setErrors((prev) => ({ ...prev, brand: null }));
                }}
              />
            )}

            <button
              type="button"
              className={`btn ${!isNewBrand ? "btn-pri" : "btn-four"}`}
              onClick={() => setIsNewBrand(!isNewBrand)}
              style={{ whiteSpace: "nowrap", fontSize: "13px" }}
            >
              {!isNewBrand ? "+ Thêm mới" : "Chọn có sẵn"}
            </button>
          </div>
          {errors.brand && <p className="form-error">{errors.brand}</p>}
        </div>

        {/* Hàng 3: Giá bán & Dung tích & Tồn kho (Gộp row để tiết kiệm diện tích) */}
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label>Giá bán (VNĐ) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Dung tích (ml)</label>
              <input
                type="number"
                name="volume_ml"
                value={formData.volume_ml}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Tồn kho</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Hàng 4: Hình ảnh */}
        <div className="form-group">
          <label>Hình ảnh (URLs)</label>
          <textarea
            name="image_urls"
            rows="3"
            placeholder="Dán link ảnh, ngăn cách bằng dấu phẩy (,)"
            onChange={handleChange}
          ></textarea>
          <small style={{ color: "#888", fontStyle: "italic" }}>
            Ảnh đầu tiên sẽ là ảnh đại diện.
          </small>
        </div>

        {/* Hàng 5: Các tầng hương (Grid 3 cột) */}
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label>Hương đầu</label>
              <input
                type="text"
                name="top_notes"
                placeholder="VD: Cam, Chanh"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Hương giữa</label>
              <input
                type="text"
                name="middle_notes"
                placeholder="VD: Hoa oải hương"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Hương cuối</label>
              <input
                type="text"
                name="base_notes"
                placeholder="VD: Gỗ đàn hương"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Hàng 6: Mô tả */}
        <div className="form-group">
          <label>Mô tả chi tiết</label>
          <textarea
            name="description"
            rows="5"
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Actions Button giống mẫu */}
        <div className="form-actions">
          <button type="submit" className="btn btn-pri" disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu sản phẩm"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-four"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
